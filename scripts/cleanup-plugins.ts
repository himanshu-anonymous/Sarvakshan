/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { prisma } from "../src/lib/db";

async function main() {
    const plugins = await prisma.installedPlugin.findMany();
    console.log("Installed plugins:");
    plugins.forEach((p) => console.log(`  ${p.pluginId} | config: ${p.config.substring(0, 60)}`));

    const geojson = plugins.find((p) => p.pluginId === "geojson");
    if (geojson) {
        await prisma.installedPlugin.delete({ where: { id: geojson.id } });
        console.log("\nDeleted orphaned 'geojson' record.");
    } else {
        console.log("\nNo orphaned 'geojson' record found.");
    }

    const remaining = await prisma.installedPlugin.findMany();
    console.log("\nRemaining plugins:");
    remaining.forEach((p) => console.log(`  ${p.pluginId}`));

    await prisma.$disconnect();
}

main().catch(console.error);
