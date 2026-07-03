/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type { WorldPlugin } from "@/core/plugins/PluginTypes";

/**
 * Static registry of plugins + dynamic registration API.
 * Plugins are registered at startup, then discovered by the PluginManager.
 */
class PluginRegistry {
    private plugins: Map<string, WorldPlugin> = new Map();

    register(plugin: WorldPlugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`[PluginRegistry] Plugin "${plugin.id}" already registered`);
            return;
        }
        this.plugins.set(plugin.id, plugin);
    }

    get(pluginId: string): WorldPlugin | undefined {
        return this.plugins.get(pluginId);
    }

    getAll(): WorldPlugin[] {
        return Array.from(this.plugins.values());
    }

    getByCategory(category: string): WorldPlugin[] {
        return this.getAll().filter((p) => p.category === category);
    }

    has(pluginId: string): boolean {
        return this.plugins.has(pluginId);
    }

    unregister(pluginId: string): void {
        this.plugins.delete(pluginId);
    }
}

export const pluginRegistry = new PluginRegistry();
