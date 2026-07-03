/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { globalState } from "./state";
import { getLatestFromSupabase, recordToSupabase } from "./supabase";
import { updateFileCache } from "./cache";
import { isHistoryEnabled } from "../../core/edition";

export async function pollAviation() {
    if (globalState.isFetching) return;
    globalState.isFetching = true;

    try {
        const now = Date.now();
        
        // Using Aviationstack API
        const url = "http://api.aviationstack.com/v1/flights?access_key=b45e12a1036269e1cd87187a9a724da8&flight_status=active&limit=100";
        
        const res = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(15000), // Aviationstack might take longer
        });

        if (!res.ok) {
            console.warn(`[Aviation Polling] Aviationstack returned ${res.status}: ${res.statusText}`);
            
            // On failure, attempt Supabase fallback if memory is empty
            if (!globalState.aviationData) {
                const fallbackData = await getLatestFromSupabase();
                if (fallbackData) {
                    globalState.aviationData = fallbackData;
                    globalState.aviationTimestamp = now;
                    updateFileCache(fallbackData, now);
                }
            }
        } else {
            const data = await res.json();
            
            if (data.data && Array.isArray(data.data)) {
                // Filter down to flights actively transmitting ADS-B live data and within India/Asian bounds
                const liveFlights = data.data.filter((f: any) => {
                    if (!f.live || f.live.latitude == null || f.live.longitude == null) return false;
                    
                    // Bounding Box for India and surrounding Asian continent
                    // Lat: -10 to 55, Lon: 40 to 150
                    const lat = f.live.latitude;
                    const lon = f.live.longitude;
                    
                    return lat >= -10 && lat <= 55 && lon >= 40 && lon <= 150;
                });
                
                // Map the Aviationstack flight object into the object format expected by the frontend plugin
                const mappedItems = liveFlights.map((f: any) => {
                    const timePosition = Math.floor(new Date(f.live.updated).getTime() / 1000);
                    return {
                        icao24: f.aircraft?.icao24 || f.flight?.iata || "UNKNOWN",
                        callsign: f.flight?.iata || f.flight?.icao || f.flight?.number || "Unknown",
                        origin_country: f.airline?.name || "Unknown",
                        time_position: timePosition,
                        last_contact: timePosition,
                        lon: f.live.longitude,
                        lat: f.live.latitude,
                        alt: f.live.altitude ? f.live.altitude / 10 : 0, // Plugin multiplies by 10
                        on_ground: f.live.is_ground,
                        spd: (f.live.speed_horizontal || 0) / 3.6, // km/h -> m/s
                        hdg: f.live.direction,
                        vertical_rate: f.live.speed_vertical || 0,
                    };
                });

                const payload = {
                    time: Math.floor(now / 1000),
                    items: mappedItems,
                    states: [], // fallback safety
                    _source: "live"
                };

                console.log(`[Aviation Polling] Fetched ${mappedItems.length} live flights out of ${data.data.length} records from Aviationstack`);
                
                // Update global state and cache
                globalState.aviationData = payload;
                globalState.aviationTimestamp = now;
                updateFileCache(payload, now);

                if (!isHistoryEnabled) {
                    // Demo edition — skip DB recording (ToS compliance)
                } else if (now - (globalState.lastDbInsert || 0) > 5 * 60 * 1000) {
                    globalState.lastDbInsert = now;
                    recordToSupabase(payload.states, payload.time).catch(
                        (err) => console.error("[Aviation Polling] DB record error:", err),
                    );
                }
            } else {
                console.warn("[Aviation Polling] Malformed Aviationstack response:", data);
            }
        }
    } catch (err) {
        const error = err as any;
        const isTimeout =
            error?.name === "AbortError" ||
            error?.name === "TimeoutError" ||
            error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
        const errorMessage = isTimeout
            ? "Connection timed out"
            : error?.message || String(error);
        
        console.error(`[Aviation Polling] Error: ${errorMessage}`);

        if (!globalState.aviationData) {
            const fallbackData = await getLatestFromSupabase();
            if (fallbackData) {
                globalState.aviationData = fallbackData;
                globalState.aviationTimestamp = Date.now();
                updateFileCache(fallbackData, globalState.aviationTimestamp);
            }
        }
    } finally {
        globalState.isFetching = false;

        if (globalState.aviationPollingInterval) {
            clearTimeout(globalState.aviationPollingInterval);
        }
        
        // Aviationstack free tier is extremely limited (100-500 requests/month).
        // Poll every 30 seconds to avoid immediately exhausting the limit.
        const adaptiveInterval = 30000;
        const jitter = Math.floor(Math.random() * 5000);
        globalState.aviationPollingInterval = setTimeout(
            pollAviation,
            adaptiveInterval + jitter,
        );
    }
}
