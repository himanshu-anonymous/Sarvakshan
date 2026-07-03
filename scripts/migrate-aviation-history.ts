/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

/**
 * @deprecated This script uses better-sqlite3 directly to migrate data
 * from Supabase into the legacy data engine's SQLite database.
 * It is NOT part of the main application's database layer.
 * It will be removed once the data engine migration is complete.
 */
import { createClient } from "@supabase/supabase-js";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Connect to SQLite DB (respects DB_PATH, fallback to data engine location)
const defaultDbPath = path.resolve(process.cwd(), "packages/wwv-data-engine/data/engine.db");
const dbPath = process.env.DB_PATH || defaultDbPath;
console.log(`Connecting to SQLite at ${dbPath}...`);

// Ensure DB directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Ensure table exists (mirroring what we'll inject into Data Engine later)
db.exec(`
    CREATE TABLE IF NOT EXISTS aviation_history (
      icao24 TEXT NOT NULL,
      ts INTEGER NOT NULL,
      lat REAL,
      lon REAL,
      alt REAL,
      hdg REAL,
      spd REAL,
      fetched_at INTEGER NOT NULL,
      PRIMARY KEY (icao24, ts)
    )
`);

const insertHistory = db.prepare(`
    INSERT OR IGNORE INTO aviation_history (icao24, ts, lat, lon, alt, hdg, spd, fetched_at)
    VALUES (@icao24, @ts, @lat, @lon, @alt, @hdg, @spd, @fetched_at)
`);

async function migrate() {
    console.log("Fetching existing aviation_history records from Supabase...");
    let offset = 0;
    const limit = 10000; // Chunk size
    let totalInserted = 0;
    
    while (true) {
        const { data, error } = await supabase
            .from("aviation_history")
            .select("*")
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Fetch error:", error);
            process.exit(1);
        }

        if (!data || data.length === 0) {
            console.log("No more records to fetch.");
            break;
        }

        console.log(`Processing ${data.length} records (Offset: ${offset})...`);

        // Batch insert to SQLite
        const insertMany = db.transaction((records) => {
            for (const r of records) {
                // Determine timestamp logic: Postgres is Timestamp so convert to epoch seconds 
                const tsMs = new Date(r.timestamp).getTime();
                
                insertHistory.run({
                    icao24: r.icao24,
                    ts: Math.floor(tsMs / 1000),
                    lat: r.latitude,
                    lon: r.longitude,
                    alt: r.altitude,
                    hdg: r.heading,
                    spd: r.speed,
                    fetched_at: Math.floor(Date.now() / 1000)
                });
            }
        });

        try {
            insertMany(data);
            totalInserted += data.length;
        } catch (err) {
            console.error("SQLite Insert Error:", err);
        }

        if (data.length < limit) {
            break; 
        }

        offset += limit;
    }

    console.log(`Migration complete! Successfully injected ~${totalInserted} records into SQLite.`);
}

migrate();
