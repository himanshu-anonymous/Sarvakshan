/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { useCallback, useRef, useState } from "react";
import type { Viewer as CesiumViewer } from "cesium";
import { Cartesian3, CameraEventType, KeyboardEventModifier } from "cesium";
import { dataBus } from "@/core/data/DataBus";
import { initPrimitiveCollections } from "../EntityRenderer";
import { useStore } from "@/core/state/store";

export function useViewerInitialization(sceneSettings: any) {
    const viewerRef = useRef<CesiumViewer | null>(null);
    const [viewerReady, setViewerReady] = useState(false);

    const handleViewerReady = useCallback(async (viewer: CesiumViewer) => {
        viewerRef.current = viewer;

        // 1. Core Viewer Settings (Sync)
        viewer.imageryLayers.removeAll();
        viewer.scene.requestRenderMode = true;
        viewer.scene.maximumRenderTimeChange = 0.5;
        viewer.scene.debugShowFramesPerSecond = sceneSettings.showFps;
        viewer.resolutionScale = sceneSettings.resolutionScale;
        viewer.scene.postProcessStages.fxaa.enabled = sceneSettings.antiAliasing === "fxaa";
        viewer.scene.msaaSamples = sceneSettings.antiAliasing === "none" || sceneSettings.antiAliasing === "fxaa" ? 1 : parseInt(sceneSettings.antiAliasing.replace("msaa", "").replace("x", ""), 10) || 1;
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // Configure Screen Space Camera
        const sscc = viewer.scene.screenSpaceCameraController;
        sscc.tiltEventTypes = [
            CameraEventType.MIDDLE_DRAG,
            CameraEventType.RIGHT_DRAG,
            CameraEventType.PINCH,
            { eventType: CameraEventType.LEFT_DRAG, modifier: KeyboardEventModifier.CTRL },
            { eventType: CameraEventType.RIGHT_DRAG, modifier: KeyboardEventModifier.CTRL }
        ];
        sscc.zoomEventTypes = [CameraEventType.WHEEL, CameraEventType.PINCH];

        if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
            (sscc as any)._zoomFactor = 5;
            (sscc as any)._translateFactor = 2;
            (sscc as any)._tiltFactor = 50;
        }

        // Initialize collections so renderers can start immediately
        initPrimitiveCollections(viewer);

        viewer.scene.renderError.addEventListener((scene, error) => {
            console.error("[Cesium Render Error] Render loop crashed! Exception:");
            console.error(error);
        });
        
        // Initial Camera Position (Sync)
        viewer.camera.setView({ destination: Cartesian3.fromDegrees(0, 20, 10000000) });

        // Signal ready NOW so UI and Overlays (OSM Box) appear instantly
        setViewerReady(true);

        // 2. Resolve Ready Event
        dataBus.emit("globeReady", {} as Record<string, never>);
        
        if (!viewer.isDestroyed()) {
            viewer.camera.setView({ destination: Cartesian3.fromDegrees(0, 20, 10000000) });
        }

    }, [sceneSettings]);

    return { viewerRef, viewerReady, handleViewerReady };
}
