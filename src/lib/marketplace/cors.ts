/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";


/** Build CORS headers for the marketplace bridge API. */
export function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("origin");

    // If there is no origin, no CORS headers are needed
    if (!origin) return {};

    // Explicitly allow ANY origin for the marketplace API routes.
    // By reflecting the origin, we permit self-hosted marketplaces on any domain/IP
    // while keeping the door open strictly for these specific endpoints.
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-marketplace-ping",
        "Access-Control-Allow-Private-Network": "true",
        "Access-Control-Max-Age": "86400",
    };
}

/** Standard preflight response. */
export function handlePreflight(request: Request): NextResponse {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request),
    });
}

/** Wrap a NextResponse with CORS headers. */
export function withCors(response: NextResponse, request: Request): NextResponse {
    const headers = corsHeaders(request);
    for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
    }
    return response;
}
