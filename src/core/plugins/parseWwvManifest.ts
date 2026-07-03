/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type { PluginManifest } from "./PluginManifest";

/**
 * Validates and converts a wwv-manifest.json into an internal PluginManifest.
 */
export function parseWwvManifest(rawManifest: any): PluginManifest {
    if (!rawManifest || typeof rawManifest !== "object") {
        throw new Error("Manifest must be a JSON object");
    }

    // Required fields mapping
    const manifest: Partial<PluginManifest> = {
        id: rawManifest.id,
        name: rawManifest.name,
        version: rawManifest.version,
        description: rawManifest.description,
        type: rawManifest.type || "data-layer",
        format: "bundle", // wwv-manifest plugins are always bundles
        trust: "unverified", // Will be overridden if fetched from marketplace
        capabilities: rawManifest.capabilities || [],
        category: rawManifest.category || "custom",
        icon: rawManifest.icon,
        compatibility: rawManifest.compatibility,
        entry: rawManifest.entry,
        assets: rawManifest.assets,
        extends: rawManifest.extends,
    };

    return manifest as PluginManifest;
}
