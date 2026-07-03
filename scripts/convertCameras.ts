/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Inline the converter logic so we can run without ts-path aliases
import { convertToGeoJson } from "../src/lib/geojson/converter";

const inputPath = resolve(__dirname, "../public/cameras.json");
const outputPath = resolve(__dirname, "../public/cameras_geojson.json");

const raw = JSON.parse(readFileSync(inputPath, "utf-8"));
const geoJson = convertToGeoJson(raw);

writeFileSync(outputPath, JSON.stringify(geoJson, null, 2), "utf-8");

console.log(`✅ Converted ${geoJson.features.length} features`);
console.log(`   Output: ${outputPath}`);
