/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

"use client";

// ─── Place Categories ────────────────────────────────────────
// Maps Google Places API type arrays to display categories with
// appropriate zoom distances for the camera.

export type PlaceCategory = "address" | "establishment" | "landmark" | "region";

interface ZoomParams {
    distance: number;
    maxPitch: number;
}

// ─── Type → Category Mapping ─────────────────────────────────
const ADDRESS_TYPES = new Set([
    "street_address", "route", "intersection", "premise",
    "subpremise", "street_number",
]);

const LANDMARK_TYPES = new Set([
    "point_of_interest", "natural_feature", "park", "tourist_attraction",
    "museum", "stadium", "amusement_park", "zoo", "aquarium",
]);

const ESTABLISHMENT_TYPES = new Set([
    "establishment", "school", "university", "hospital", "church",
    "airport", "train_station", "transit_station", "shopping_mall",
    "store", "restaurant", "lodging", "library", "bank",
    "local_government_office", "embassy",
]);

const REGION_TYPES = new Set([
    "locality", "sublocality", "administrative_area_level_1",
    "administrative_area_level_2", "country", "postal_code",
    "geocode", "political",
]);

/** Classify a Google Places `types[]` into a display category. */
export function categorizePlace(types: string[]): PlaceCategory {
    for (const t of types) {
        if (ADDRESS_TYPES.has(t)) return "address";
        if (LANDMARK_TYPES.has(t)) return "landmark";
        if (ESTABLISHMENT_TYPES.has(t)) return "establishment";
    }
    for (const t of types) {
        if (REGION_TYPES.has(t)) return "region";
    }
    // Default: treat unknown types as addresses (most specific)
    return "address";
}

// ─── Viewport Types ──────────────────────────────────────────
export interface LatLng { lat: number; lng: number }
export interface Viewport { northeast: LatLng; southwest: LatLng }

// ─── Zoom Params ─────────────────────────────────────────────
const ZOOM_BY_CATEGORY: Record<PlaceCategory, ZoomParams> = {
    address: { distance: 1_000, maxPitch: -40 },
    establishment: { distance: 5_000, maxPitch: -45 },
    landmark: { distance: 5_000, maxPitch: -45 },
    region: { distance: 5_000_000, maxPitch: -70 },
};

const CITY_ZOOM: ZoomParams = { distance: 50_000, maxPitch: -50 };

const EARTH_RADIUS_M = 6_371_000;
const VIEWPORT_PADDING = 1.8; // 80% extra to keep margins

/** Haversine distance between two lat/lng points in metres. */
function haversineMetres(a: LatLng, b: LatLng): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
        Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Compute camera distance from viewport bounds so the place fits in frame. */
export function distanceFromViewport(vp: Viewport): number {
    const diagonal = haversineMetres(vp.southwest, vp.northeast);
    return Math.max(diagonal * VIEWPORT_PADDING, 500); // min 500 m
}

/** Get camera zoom params, preferring viewport bounds when available. */
export function getZoomForTypes(
    types?: string[],
    viewport?: Viewport | null
): ZoomParams {
    // Use viewport when available for precise fit
    if (viewport?.northeast && viewport?.southwest) {
        const distance = distanceFromViewport(viewport);
        const category = categorizePlace(types || []);
        const pitch = ZOOM_BY_CATEGORY[category].maxPitch;
        return { distance, maxPitch: pitch };
    }

    // Fallback to classification-based defaults
    if (!types || types.length === 0) {
        return ZOOM_BY_CATEGORY.region;
    }
    if (types.includes("locality")) return CITY_ZOOM;

    const category = categorizePlace(types);
    return ZOOM_BY_CATEGORY[category];
}

