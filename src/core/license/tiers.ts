/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

export type LicenseTier = "free" | "pro" | "team" | "enterprise";

export interface TierFeatures {
    maxUsers: number;
    storageQuotaBytes: number;
    historyEnabled: boolean;
    snapshotCapture: boolean;
    customDomains: boolean;
}

export const TIER_FEATURES: Record<LicenseTier, TierFeatures> = {
    free: { maxUsers: 3, storageQuotaBytes: 500 * 1024 * 1024, historyEnabled: false, snapshotCapture: false, customDomains: false },
    pro: { maxUsers: 20, storageQuotaBytes: 5 * 1024 * 1024 * 1024, historyEnabled: true, snapshotCapture: true, customDomains: false },
    team: { maxUsers: -1, storageQuotaBytes: -1, historyEnabled: true, snapshotCapture: true, customDomains: false },
    enterprise: { maxUsers: -1, storageQuotaBytes: -1, historyEnabled: true, snapshotCapture: true, customDomains: true },
};
