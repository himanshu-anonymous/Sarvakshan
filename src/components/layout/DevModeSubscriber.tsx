/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

"use client";

import { useEffect, useState } from "react";
import { pluginManager } from "@/core/plugins/PluginManager";
import { useStore } from "@/core/state/store";

export function DevModeSubscriber() {
    const [connected, setConnected] = useState(false);
    const initLayer = useStore((s) => s.initLayer);

    useEffect(() => {
        // Only run in development
        if (process.env.NODE_ENV !== "development") return;

        let ws: WebSocket;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            // Attempt to connect to the wwv-cli dev server default port
            ws = new WebSocket("ws://localhost:24601/__wwv_dev__");

            ws.onopen = () => {
                console.log("[DevMode] Connected to WWV Dev Server 🔧");
                setConnected(true);
            };

            ws.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === "plugin:added") {
                        console.log(`[DevMode] Plugin added from CLI: ${data.manifest.id}`);
                        await pluginManager.loadFromManifest(data.manifest);
                        initLayer(data.manifest.id, true);
                        await pluginManager.enablePlugin(data.manifest.id);
                        
                    } else if (data.type === "plugin:updated") {
                        console.log(`[DevMode] Reloading plugin: ${data.pluginId}`);
                        // Destroy and re-load from manifest for dev hot-reload
                        pluginManager.disablePlugin(data.pluginId);
                        if (data.manifest) {
                            await pluginManager.loadFromManifest(data.manifest);
                            initLayer(data.manifest.id, true);
                            await pluginManager.enablePlugin(data.manifest.id);
                        }
                        
                    } else if (data.type === "plugin:error") {
                        console.error(`[DevMode] Dev Server Build Error: ${data.error}`);
                        useStore.getState().showErrorToast?.(`Build Error in ${data.pluginId}: ${data.error}`);
                    }
                } catch (err) {
                    console.error("[DevMode] Error handling message:", err);
                }
            };

            ws.onclose = () => {
                if (connected) {
                    console.log("[DevMode] Disconnected from WWV Dev Server.");
                    setConnected(false);
                }
                reconnectTimer = setTimeout(connect, 2000);
            };

            ws.onerror = () => {
                // Ignore connection refused errors when CLI is not running
            };
        };

        connect();

        return () => {
            clearTimeout(reconnectTimer);
            if (ws) ws.close();
        };
    }, [connected, initLayer]);

    // This component doesn't render anything visibly
    return null;
}
