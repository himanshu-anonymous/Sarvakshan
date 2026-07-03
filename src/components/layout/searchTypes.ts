/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type { GeoEntity } from "@/core/plugins/PluginTypes";
import type { PlaceCategory } from "./placeCategories";

export interface SearchResult {
    id: string;
    label: string;
    subLabel?: string;
    score: number;
    lat: number;
    lon: number;
    type: "country" | "entity" | "place";
    pluginId?: string;
    entity?: GeoEntity;
    placeCategory?: PlaceCategory;
}

export interface SearchSection {
    title: string;
    icon: React.ReactNode;
    results: SearchResult[];
    maxScore: number;
}
