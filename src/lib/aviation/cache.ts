/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { globalState } from "./state";

export function getCachedAviationData() {
    if (globalState.aviationData) {
        return {
            data: globalState.aviationData,
            timestamp: globalState.aviationTimestamp,
        };
    }

    return {
        data: null,
        timestamp: 0,
    };
}

/** @deprecated No longer writes to disk — retained for call-site compatibility */
export function updateFileCache(_data: unknown, _timestamp: number) {
    // No-op: in-memory globalState is updated directly by polling.ts
}
