/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
    try {
        const response = await fetch("https://www.submarinecablemap.com/api/v3/cable/cable-geo.json", {
            headers: {
                "User-Agent": "WorldWideView/1.0",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch from target URL (Status: ${response.status})` },
                { status: response.status },
            );
        }

        const data = await response.json();

        // Bounding Box for India and surrounding Asian continent
        // Lat: -10 to 55, Lon: 40 to 150
        if (data && Array.isArray(data.features)) {
            data.features = data.features.filter((feature: any) => {
                if (!feature.geometry || !feature.geometry.coordinates) return true; // keep if unknown

                let coords = feature.geometry.coordinates;
                // Handle MultiLineString vs LineString
                if (feature.geometry.type === "LineString") {
                    coords = [coords]; // Wrap in array to treat like MultiLineString
                } else if (feature.geometry.type !== "MultiLineString") {
                    return true;
                }

                // Check if any point in any segment falls within the bounding box
                for (const segment of coords) {
                    if (!Array.isArray(segment)) continue;
                    for (const point of segment) {
                        if (!Array.isArray(point) || point.length < 2) continue;
                        const lon = point[0];
                        const lat = point[1];
                        if (lat >= -10 && lat <= 55 && lon >= 40 && lon <= 150) {
                            return true; // Keep this cable
                        }
                    }
                }
                return false; // Discard this cable
            });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[UnderseaCablesProxy] Error:", error);
        return NextResponse.json(
            { error: "Failed to proxy request" },
            { status: 500 },
        );
    }
}
