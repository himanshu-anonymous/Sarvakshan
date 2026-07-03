/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const SCOPE = "marketplace";
const ISSUER = "Sarvakshan";
const AUDIENCE = "Sarvakshan-marketplace";
const EXPIRY = "4h";

// Simple in-memory revocation list for JWT tokens (resets on restart)
// In a distributed setup, this should be backed by Redis.
const revokedJtis = new Set<string>();

function getSecret(): Uint8Array {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET is not set");
    return new TextEncoder().encode(secret);
}

/**
 * Issue a JWT scoped to marketplace API access, bound to a specific user.
 * Signed with AUTH_SECRET — no database required.
 */
export async function issueMarketplaceToken(userId: string): Promise<string> {
    return new SignJWT({ scope: SCOPE })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setJti(randomUUID())
        .setIssuedAt()
        .setExpirationTime(EXPIRY)
        .sign(getSecret());
}

export interface MarketplaceTokenPayload {
    scope: string;
    sub: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
    jti?: string;
}

/**
 * Revoke a specific marketplace JWT by its JTI claim.
 */
export function revokeMarketplaceToken(jti: string): void {
    if (jti) revokedJtis.add(jti);
}

/**
 * Verify a marketplace JWT. Throws if invalid, expired, wrong scope,
 * or missing required claims (sub, iss, aud).
 */
export async function verifyMarketplaceToken(
    token: string,
): Promise<MarketplaceTokenPayload> {
    const { payload } = await jwtVerify(token, getSecret(), {
        issuer: ISSUER,
        audience: AUDIENCE,
    });
    if (payload.scope !== SCOPE) {
        throw new Error("Token scope mismatch");
    }
    if (!payload.sub) {
        throw new Error("Token missing subject");
    }
    if (payload.jti && revokedJtis.has(payload.jti as string)) {
        throw new Error("Token has been revoked");
    }
    return payload as unknown as MarketplaceTokenPayload;
}
