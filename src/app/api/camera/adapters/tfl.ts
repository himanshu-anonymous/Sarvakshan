/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { fetchTflCameras } from "../tfl/tflFetcher";
import type { CameraAdapter, CameraFeature } from "./types";

export const tflAdapter: CameraAdapter = {
    id: "tfl",
    displayName: "TfL JamCams (London)",
    region: "United Kingdom — London",
    fetch: async () => (await fetchTflCameras()) as CameraFeature[],
};
