/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import fs from "fs";
import path from "path";

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    try {
        const envLocalPath = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(envLocalPath)) {
            const envContent = fs.readFileSync(envLocalPath, "utf8");
            const match = envContent.match(/^DATABASE_URL=["']?(.*?)["']?$/m);
            if (match) {
                dbUrl = match[1].trim();
            }
        }
        if (!dbUrl) {
            const envPath = path.resolve(process.cwd(), ".env");
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, "utf8");
                const match = envContent.match(/^DATABASE_URL=["']?(.*?)["']?$/m);
                if (match) {
                    dbUrl = match[1].trim();
                }
            }
        }
    } catch (e) {
        // Ignore
    }
}

export default {
    datasource: {
        url: dbUrl,
    },
};