/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { authLimiter } from "@/lib/rateLimiters";
import { getClientIp } from "@/lib/rateLimit";

export const { GET } = handlers;

/** Wrap NextAuth POST (sign-in) with rate limiting. */
export async function POST(request: NextRequest) {
    const rateLimited = authLimiter.check(getClientIp(request));
    if (rateLimited) return rateLimited;

    return handlers.POST(request);
}
