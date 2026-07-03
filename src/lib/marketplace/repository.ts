/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { prisma } from "../db";

/** Get all installed marketplace plugins. */
export async function getInstalledPlugins() {
    return prisma.installedPlugin.findMany({
        orderBy: { installedAt: "desc" },
    });
}

/** Check if a plugin is already installed. */
export async function isInstalled(pluginId: string): Promise<boolean> {
    const record = await prisma.installedPlugin.findFirst({ where: { pluginId } });
    return record !== null;
}

/** Install or update a plugin record. Uses upsert on the unique pluginId. */
export async function upsertPlugin(pluginId: string, version: string, config?: string) {
    const existing = await prisma.installedPlugin.findFirst({ where: { pluginId } });
    if (existing) {
        await prisma.installedPlugin.updateMany({
            where: { pluginId },
            data: { version, config: config ?? undefined, enabled: true },
        });
        return prisma.installedPlugin.findFirst({ where: { pluginId } });
    } else {
        return prisma.installedPlugin.create({
            data: { pluginId, version, config: config ?? "{}", enabled: true },
        });
    }
}

/** Remove an installed plugin record. Returns 0 or 1. */
export async function uninstallPlugin(pluginId: string) {
    try {
        await prisma.installedPlugin.deleteMany({ where: { pluginId } });
        return 1;
    } catch {
        return 0;
    }
}

/** Disable a plugin (built-in or marketplace) without removing its record. */
export async function disablePlugin(pluginId: string) {
    const existing = await prisma.installedPlugin.findFirst({ where: { pluginId } });
    if (existing) {
        await prisma.installedPlugin.updateMany({
            where: { pluginId },
            data: { enabled: false },
        });
        return prisma.installedPlugin.findFirst({ where: { pluginId } });
    } else {
        return prisma.installedPlugin.create({
            data: { pluginId, version: "built-in", config: "{}", enabled: false },
        });
    }
}

/** Re-enable a disabled plugin. */
export async function enablePlugin(pluginId: string) {
    return prisma.installedPlugin.updateMany({
        where: { pluginId },
        data: { enabled: true },
    });
}

/** Get the set of plugin IDs that have been disabled. */
export async function getDisabledPluginIds(): Promise<Set<string>> {
    const records = await prisma.installedPlugin.findMany({
        where: { enabled: false },
        select: { pluginId: true },
    });
    return new Set(records.map((r: any) => r.pluginId));
}
