/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/core/state/store";
import { pluginManager } from "@/core/plugins/PluginManager";
import { dataBus } from "@/core/data/DataBus";

/**
 * Syncs the Zustand timeline state with the plugin manager polling
 * and emits time-based events.
 */
export function TimelineSync() {
    const currentTime = useStore((s) => s.currentTime);
    const timeRange = useStore((s) => s.timeRange);
    const isPlaybackMode = useStore((s) => s.isPlaybackMode);
    const setTimelineAvailability = useStore((s) => s.setTimelineAvailability);

    // Playback state trackers
    const lastFetchTimeRef = useRef(currentTime.getTime());

    // Sync to plugins? Currently plugins fetch entire time ranges and store them.
    // Real-time updates could notify plugins to re-fetch on timeRange changes.
    useEffect(() => {
        const unsub = dataBus.on("timeRangeChanged", ({ timeRange }) => {
            pluginManager.updateTimeRange(timeRange);
        });
        return unsub;
    }, []);

    // Sync Timeline Availability
    useEffect(() => {
        if (!isPlaybackMode) return;

        const fetchAvailability = (pluginId: string) => {
            const plugin = pluginManager.getPlugin(pluginId)?.plugin;
            if (!plugin) return;
            const config = plugin.getServerConfig?.();
            if (config?.availabilityEnabled && config.apiBasePath) {
                fetch(`${config.apiBasePath}/availability`)
                    .then((r) => r.json())
                    .then((data) => {
                        if (data.availability) {
                            setTimelineAvailability(pluginId, data.availability);
                        }
                    })
                    .catch((err) =>
                        console.error(`[TimelineSync] Availability fetch failed for ${pluginId}`, err)
                    );
            }
        };

        // Fetch for already enabled plugins
        const active = pluginManager.getEnabledPlugins();
        for (const { plugin } of active) {
            fetchAvailability(plugin.id);
        }

        const unsub = dataBus.on("layerToggled", ({ pluginId, enabled }) => {
            if (enabled) {
                fetchAvailability(pluginId);
            } else {
                setTimelineAvailability(pluginId, []);
            }
        });

        return unsub;
    }, [isPlaybackMode, setTimelineAvailability]);

    // Playback Mode: Trigger fetches when time changes significantly (e.g. by scrubber or playback)
    useEffect(() => {
        if (!isPlaybackMode) return;

        const now = currentTime.getTime();
        // Trigger a fetch if time has moved by more than 15 seconds (matches backend recording frequency)
        if (Math.abs(now - lastFetchTimeRef.current) > 15000) {
            lastFetchTimeRef.current = now;
            pluginManager.updateTimeRange(timeRange);
        }
    }, [currentTime, isPlaybackMode, timeRange]);

    return null; // Logic-only component
}
