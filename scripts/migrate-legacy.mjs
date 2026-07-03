import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import path from "node:path";
import fs from "node:fs";

async function migrate() {
    const targetPath = process.argv[2] || "data/wwv.db";
    const sqlitePath = path.resolve(process.cwd(), targetPath);
    
    if (!fs.existsSync(sqlitePath)) {
        console.error(`❌ No legacy SQLite database found at ${targetPath}`);
        console.error("💡 Usage: node scripts/migrate-legacy.mjs [path-to-db]");
        process.exit(1);
    }

    console.log(`📂 Found legacy database at ${targetPath}. Initializing migration...`);
    
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    const db = new DatabaseSync(sqlitePath);

    try {
        // 1. Migrate Users
        console.log("👤 Migrating users...");
        const users = db.prepare("SELECT * FROM users").all();
        for (const user of users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    hashedPassword: user.hashedPassword,
                    role: user.role,
                    createdAt: new Date(user.createdAt),
                }
            });
        }

        // 2. Migrate Favorites
        console.log("⭐️ Migrating favorites...");
        const favorites = db.prepare("SELECT * FROM favorites").all();
        for (const fav of favorites) {
            await prisma.favorite.upsert({
                where: { id: fav.id },
                update: {},
                create: {
                    id: fav.id,
                    userId: fav.userId,
                    entityId: fav.entityId,
                    pluginId: fav.pluginId,
                    label: fav.label,
                    pluginName: fav.pluginName,
                    lastSeen: new Date(fav.lastSeen),
                }
            });
        }

        // 3. Migrate Settings
        console.log("⚙️ Migrating settings...");
        const settings = db.prepare("SELECT * FROM settings").all();
        for (const setting of settings) {
            const existing = await prisma.setting.findFirst({
                where: { key: setting.key, tenantId: setting.tenantId || null }
            });
            if (existing) {
                await prisma.setting.update({
                    where: { id: existing.id },
                    data: { value: setting.value }
                });
            } else {
                await prisma.setting.create({
                    data: {
                        id: setting.id || undefined, // Let Prisma generate if undefined
                        tenantId: setting.tenantId || null,
                        key: setting.key,
                        value: setting.value,
                    }
                });
            }
        }

        console.log("✅ Migration successful! All data moved to PostgreSQL.");
        console.log("💡 You can now safely delete prisma/dev.db");
        
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
