/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { useEffect, useRef } from "react";
import {
    Viewer as CesiumViewer,
    ImageryLayer,
    SceneMode,
    Cesium3DTileset,
    createGooglePhotorealistic3DTileset,
    GoogleMaps
} from "cesium";
import { useStore } from "@/core/state/store";
import { createImageryProvider } from "./ImageryProviderFactory";
import { getUserApiKey } from "@/lib/userApiKeys";

export function useImageryManager(viewer: CesiumViewer | null, viewerReady: boolean) {
    const baseLayerId = useStore((s) => s.mapConfig.baseLayerId);
    const fallbackLayerId = useStore((s) => s.mapConfig.fallbackLayerId);
    const sceneMode = useStore((s) => s.mapConfig.sceneMode);
    const maxScreenSpaceError = useStore((s) => s.mapConfig.maxScreenSpaceError);

    // Resolve runtime truth:
    const activeLayerId = fallbackLayerId || baseLayerId;

    const currentImageryLayerRef = useRef<ImageryLayer | null>(null);
    const loadingTilesetRef = useRef<boolean>(false);

    // 1. Manage Scene Mode (2D / 3D / Columbus)
    useEffect(() => {
        if (!viewer || !viewerReady || viewer.isDestroyed()) return;

        let targetMode = SceneMode.SCENE3D;
        if (sceneMode === 1) targetMode = SceneMode.COLUMBUS_VIEW;
        if (sceneMode === 2) targetMode = SceneMode.SCENE2D;

        if (viewer.scene.mode !== targetMode) {
            if (targetMode === SceneMode.SCENE2D) viewer.scene.morphTo2D(1.0);
            else if (targetMode === SceneMode.SCENE3D) viewer.scene.morphTo3D(1.0);
            else if (targetMode === SceneMode.COLUMBUS_VIEW) viewer.scene.morphToColumbusView(1.0);
        }
    }, [viewer, viewerReady, sceneMode]);

    // 2. Manage Imagery Layer and Google 3D Tiles
    useEffect(() => {
        if (!viewer || !viewerReady || viewer.isDestroyed()) return;

        async function updateImagery() {
            if (!viewer || !viewerReady || viewer.isDestroyed()) return;

            // Handle Google 3D Tiles specifically
            const isGoogle3D = activeLayerId === "google-3d";

            // Toggle Google 3D Tileset visibility if it exists
            // Or find it in primitives
            const primitives = viewer.scene.primitives;
            let foundTileset: Cesium3DTileset | null = null;

            for (let i = 0; i < primitives.length; i++) {
                const p = primitives.get(i);
                // Simple check for Google Tileset - usually it has Google in cache key or type
                if (p instanceof Cesium3DTileset) {
                    foundTileset = p;
                    break;
                }
            }

            // Lazy-load Google Tileset if not present and requested
            if (isGoogle3D && !foundTileset && !loadingTilesetRef.current) {
                loadingTilesetRef.current = true;
                try {
                    console.log("[useImageryManager] Dynamic initialization of Google 3D Tiles...");
                    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                    const userGoogleKey = getUserApiKey("google_maps");
                    const activeKey = (userGoogleKey && userGoogleKey.length >= 20) ? userGoogleKey : envKey;

                    if (activeKey && activeKey.length >= 20) {
                        GoogleMaps.defaultApiKey = activeKey;
                    }

                    const tileset = await createGooglePhotorealistic3DTileset({
                        onlyUsingWithGoogleGeocoder: true,
                        ...({ enableCollision: true } as Record<string, unknown>),
                    });

                    if (!viewer || viewer.isDestroyed()) return;

                    tileset.maximumScreenSpaceError = maxScreenSpaceError || 16;
                    (tileset as any).maximumMemoryUsage = 2048;
                    foundTileset = viewer.scene.primitives.add(tileset);
                    console.log("[useImageryManager] Successfully added Google 3D Tileset to primitives.");
                } catch (err) {
                    console.error("[useImageryManager] Critical failure creating Google 3D Tileset:", err);
                    if (viewer && !viewer.isDestroyed()) {
                        useStore.getState().updateMapConfig({ fallbackLayerId: "bing-aerial" });
                    }
                } finally {
                    loadingTilesetRef.current = false;
                }
            }

            // Final safety check before manipulating state post-async
            if (!viewer || viewer.isDestroyed()) return;

            if (foundTileset) {
                foundTileset.show = isGoogle3D;
            }

            // If we are in Google 3D mode, we usually hide the globe surface 
            viewer.scene.globe.show = !isGoogle3D;

            // Manage standard imagery layer
            if (isGoogle3D) {
                // Remove current custom imagery if switching to Google 3D
                if (currentImageryLayerRef.current) {
                    viewer.imageryLayers.remove(currentImageryLayerRef.current);
                    currentImageryLayerRef.current = null;
                }
            } else {
                // Instantiate and Add new imagery provider
                try {
                    const provider = await createImageryProvider(activeLayerId);
                    const newLayer = new ImageryLayer(provider);

                    if (currentImageryLayerRef.current) {
                        viewer.imageryLayers.remove(currentImageryLayerRef.current);
                    }

                    // Add as base layer (bottom)
                    if (viewer.isDestroyed()) return;
                    viewer.imageryLayers.add(newLayer, 0);
                    currentImageryLayerRef.current = newLayer;
                } catch (err) {
                    console.error("[useImageryManager] Failed to load imagery:", activeLayerId, err);
                }
            }
        }

        updateImagery();
    }, [viewer, viewerReady, baseLayerId, fallbackLayerId, maxScreenSpaceError]);

    return {
        isGoogle3D: activeLayerId === "google-3d"
    };
}
