/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import * as jose from "jose";

// Public key is safe to hardcode/ship to client
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu... (generate real one)
-----END PUBLIC KEY-----`;

export interface LicensePayload {
    tier: "free" | "pro" | "team" | "enterprise";
    exp: number;
    org: string;
}

export async function verifyLicenseKey(token: string): Promise<LicensePayload | null> {
    try {
        const publicKey = await jose.importSPKI(PUBLIC_KEY_PEM, "RS256");
        const { payload } = await jose.jwtVerify(token, publicKey);
        return payload as unknown as LicensePayload;
    } catch {
        return null;
    }
}
