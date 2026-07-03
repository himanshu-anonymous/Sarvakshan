/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";
import { getAvailabilityRange } from "../../../../lib/aviation/repository";
import { isHistoryEnabled } from "../../../../core/edition";

// Cache the availability response for 5 minutes — this metadata changes slowly
let cachedAvailability: { data: unknown; expiresAt: number } | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    if (!isHistoryEnabled) {
        return NextResponse.json({ availability: [] });
    }

    // Return cached response if still fresh
    if (cachedAvailability && Date.now() < cachedAvailability.expiresAt) {
        return NextResponse.json(cachedAvailability.data);
    }

    try {
        const ranges = await getAvailabilityRange();
        const result = { availability: ranges };
        cachedAvailability = { data: result, expiresAt: Date.now() + TTL_MS };
        return NextResponse.json(result);
    } catch (err) {
        console.error("[API/aviation/availability] Error:", err);
        return NextResponse.json({ availability: [] });
    }
}
