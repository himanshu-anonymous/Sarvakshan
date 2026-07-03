/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";
import { getAdapterMetadata } from "../adapters/registry";

/**
 * Returns metadata for every registered camera adapter so the client plugin
 * can render a dynamic settings UI (source toggles, key-required hints,
 * health indicators) without hardcoding the adapter list. Adding a source
 * to `adapters/registry.ts` makes it appear here automatically.
 */
export async function GET() {
    return NextResponse.json({ adapters: getAdapterMetadata() });
}
