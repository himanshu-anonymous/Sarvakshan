/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";
import { validateManifest } from "@/core/plugins/validateManifest";
import { parseWwvManifest } from "@/core/plugins/parseWwvManifest";

export async function OPTIONS() {
    // Allows the WWV CLI (running on a different port) to hit this endpoint
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

/**
 * POST /api/dev/load-unpacked
 *
 * Called by the `@Sarvakshan/cli` dev server when it starts.
 * It sends the `wwv-manifest.json` + `devUrl` (the CLI dev server URL).
 */
export async function POST(request: Request) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "Developer mode is only available in development environments" },
            { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
        );
    }

    try {
        const body = await request.json();
        
        // Convert wwv-manifest.json format to PluginManifest format
        const manifest = parseWwvManifest(body);
        
        // Dev-loaded plugins are unverified by default
        manifest.trust = "unverified";

        const validation = validateManifest(manifest);
        if (!validation.valid) {
            return NextResponse.json(
                { error: "Invalid manifest", details: validation.errors },
                { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
            );
        }

        return NextResponse.json(
            { status: "loaded", manifest },
            { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
        );
    } catch (err) {
        console.error("[Load Unpacked] Error:", err);
        return NextResponse.json(
            { error: "Failed to parse or load unpacked manifest" },
            { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
        );
    }
}
