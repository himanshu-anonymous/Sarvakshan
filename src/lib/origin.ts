/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type { NextRequest } from "next/server";

/**
 * Robustly determines the public-facing origin of a request.
 * Useful for building absolute redirect URLs when running behind Docker/Coolify proxies
 * where request.nextUrl.origin might incorrectly resolve to an internal 0.0.0.0 binding.
 */
export function getRequestOrigin(request: NextRequest): string {
    const envOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.AUTH_URL;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "http";
    const host = request.headers.get("host");
    const nextUrlOrigin = request.nextUrl.origin;

    console.log("[Origin Debug] Headers & Env:", {
        envOrigin,
        forwardedHost,
        forwardedProto,
        host,
        nextUrlOrigin,
        requestUrl: request.url,
    });

    let finalOrigin = nextUrlOrigin;

    // In multi-tenant or proxied environments, the actual requested host must take precedence
    // over a hardcoded env string, otherwise subdomain isolation and local proxies will break.
    if (forwardedHost) {
        const resolved = `${forwardedProto}://${forwardedHost}`;
        console.log(`[Origin Debug] Resolving to forwardedHost: ${resolved}`);
        finalOrigin = resolved;
    } else if (host && !host.includes("0.0.0.0")) {
        const resolved = `${forwardedProto}://${host}`;
        console.log(`[Origin Debug] Resolving to host header: ${resolved}`);
        finalOrigin = resolved;
    } else if (envOrigin) {
        console.log(`[Origin Debug] Resolving to envOrigin: ${envOrigin}`);
        finalOrigin = envOrigin;
    } else {
        console.log(`[Origin Debug] Falling back to NextUrl origin: ${nextUrlOrigin}`);
    }

    // Safety net: Browsers will instantly block 0.0.0.0. Replace with localhost.
    if (finalOrigin.includes("0.0.0.0")) {
        console.warn("[Origin Debug] FATAL: Origin resolved to 0.0.0.0. Replacing with localhost as a last resort.");
        finalOrigin = finalOrigin.replace("0.0.0.0", "localhost");
    }

    return finalOrigin;
}
