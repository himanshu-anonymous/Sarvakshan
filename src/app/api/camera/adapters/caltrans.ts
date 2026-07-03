/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { fetchCaltransCameras } from "../caltrans/caltransFetcher";
import type { CameraAdapter, CameraFeature } from "./types";

export const caltransAdapter: CameraAdapter = {
    id: "caltrans",
    displayName: "Caltrans (California)",
    region: "United States — California",
    fetch: async () => (await fetchCaltransCameras()) as CameraFeature[],
};
