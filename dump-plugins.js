/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
prisma.installedPlugin.findMany().then(r => console.log(JSON.stringify(r.map(record => {
   const manifest = JSON.parse(record.config);
   return { id: manifest.id, entry: manifest.entry, format: manifest.format };
}), null, 2))).catch(console.error).finally(() => prisma.$disconnect());
