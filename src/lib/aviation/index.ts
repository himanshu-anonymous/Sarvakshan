/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { globalState, POLL_INTERVAL } from "./state";
import { getCachedAviationData } from "./cache";
import { pollAviation } from "./polling";

export { getCachedAviationData };

export function startAviationPolling() {
    if (globalState.aviationPollingStarted) {
        return;
    }

    globalState.aviationPollingStarted = true;
    globalState.currentBackoff = POLL_INTERVAL;
    console.log(`[Aviation Polling] Starting background polling with initial interval ${POLL_INTERVAL}ms`);

    // Run immediately, the next poll will be scheduled in the finally block
    pollAviation();
}
