import fs from 'fs';
import path from 'path';

// Manual layer definitions extracted from Godseye
const LAYER_DEFS = {
    aircraft: { label: 'AIRCRAFT', color: '#00b4ff', icon: '✈', description: 'Live ADS-B/Mode-S aircraft tracks.', poll: 15000 },
    satellites: { label: 'SATELLITES', color: '#ffaa00', icon: '🛰', description: 'Orbiting satellites propagated from TLE feeds.', poll: 5000 },
    seismic: { label: 'SEISMIC', color: '#ff3333', icon: '◉', description: 'Recent earthquake events with magnitude/depth.', poll: 60000 },
    airports: { label: 'AIRPORTS', color: '#93c5fd', icon: '🛬', description: 'Global airport infrastructure and metadata.', poll: 86400000 },
    hazards: { label: 'HAZARDS', color: '#ff8a3d', icon: '☣', description: 'General hazard overlays from open feeds.', poll: 120000 },
    disasters: { label: 'DISASTERS', color: '#ff6f61', icon: '☄', description: 'Global disaster incidents and alerts.', poll: 180000 },
    conflicts: { label: 'CONFLICTS', color: '#ff4d6d', icon: '⚔', description: 'Open-source conflict and unrest event signals.', poll: 900000 },
    maritime: { label: 'MARITIME', color: '#00ffd5', icon: '⛴', description: 'Global port network + live AIS vessel tracking.', poll: 43200000 },
    oceanBuoys: { label: 'OCEAN BUOYS', color: '#38bdf8', icon: '⚓', description: 'Buoy observations: waves, wind, pressure, sea temp.', poll: 300000 },
    volcanoes: { label: 'VOLCANOES', color: '#ff4d4d', icon: '🌋', description: 'Volcanic activity and monitoring notices.', poll: 3600000 },
    spaceWeather: { label: 'SPACE WX', color: '#a3e635', icon: '☀', description: 'NOAA aurora probability model.', poll: 300000 },
    metar: { label: 'METAR WX', color: '#60a5fa', icon: '⛅', description: 'Airport weather observations.', poll: 180000 },
    fireHotspots: { label: 'FIRE HOTSPOTS', color: '#ff5b24', icon: '🔥', description: 'Active thermal fire detections from satellites.', poll: 600000 },
    aviationHazards: { label: 'AIR HAZARDS', color: '#ff8b3d', icon: '✹', description: 'AIRMET/SIGMET polygons and aviation weather hazards.', poll: 300000 },
    solarFlares: { label: 'SOLAR FLARES', color: '#ffcc66', icon: '☀', description: 'Recent solar flare activity from SWPC feeds.', poll: 300000 },
    seismicStations: { label: 'SEIS STATIONS', color: '#22d3ee', icon: '📡', description: 'Seismometer station network locations.', poll: 43200000 },
    weather: { label: 'WEATHER', color: '#7dd3fc', icon: '☁', description: 'Global sampled weather field with alert merge.', poll: 600000 },
    airQuality: { label: 'AIR QUALITY', color: '#84cc16', icon: 'AQ', description: 'Air quality indicators (AQI, PM2.5, ozone).', poll: 600000 },
    powerGrid: { label: 'POWER GRID', color: '#facc15', icon: '⚡', description: 'Real-time outage intelligence + global power infrastructure.', poll: 300000 },
    cctv: { label: 'CCTV', color: '#00ff41', icon: '📹', description: 'Public live camera feeds and refresh streams.', poll: 5000 },
    traffic: { label: 'TRAFFIC', color: '#ff69b4', icon: '🚗', description: 'Traffic flow animation and traffic-linked cams.', poll: 600000 },
    militaryActivity: { label: 'MIL ACTIVITY', color: '#ff5b5b', icon: '⚠', description: 'Likely military flights inferred from air traffic feed.', poll: 15000 },
    militaryBases: { label: 'MIL BASES', color: '#f7c15a', icon: '⌂', description: 'Public military installation locations.', poll: 86400000 },
    forbiddenZones: { label: 'NO-GO ZONES', color: '#ff4d4d', icon: '⛔', description: 'Restricted/forbidden areas and access-limited zones.', poll: 86400000 },
    airspace: { label: 'AIRSPACE', color: '#00ffff', icon: '⬡', description: 'No-fly/restricted airspace overlays.', poll: 86400000 },
};

const pluginsDir = path.resolve('src/plugins');

Object.entries(LAYER_DEFS).forEach(([id, def]) => {
    // Skip if it already exists in our system naturally (like earthquakes, geojson)
    if (id === 'geojson' || id === 'earthquakes' || id === 'aircraft') return;

    const pluginName = `osint-${id}`;
    const pluginDir = path.join(pluginsDir, pluginName);

    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir, { recursive: true });
    }

    const pluginJson = {
        id: pluginName,
        name: def.label,
        version: "1.0.0",
        publisher: "sarvakshan",
        description: def.description,
        category: "intelligence",
        format: "static",
        capabilities: ["data-source"],
        requires: { envVars: [] }
    };

    fs.writeFileSync(
        path.join(pluginDir, 'plugin.json'),
        JSON.stringify(pluginJson, null, 2)
    );

    const indexTs = `
import { WorldPlugin, PluginContext, GeoEntity } from "@Sarvakshan/wwv-plugin-sdk";
import { Layers } from "lucide-react";

export class Osint${id.charAt(0).toUpperCase() + id.slice(1)}Plugin implements WorldPlugin {
    id = "${pluginName}";
    name = "${def.label}";
    description = "${def.description}";
    icon = Layers;
    category = "intelligence" as any;
    version = "1.0.0";

    private ctx!: PluginContext;

    async initialize(ctx: PluginContext) {
        this.ctx = ctx;
        console.log(\`[\${this.name}] Headless OSINT plugin initialized.\`);
    }

    destroy() {
        console.log(\`[\${this.name}] Destroyed.\`);
    }

    getPollingInterval() {
        return ${def.poll};
    }

    async fetch(timeRange: { start: Date; end: Date }): Promise<GeoEntity[]> {
        // Functionality ported from Godseye (Backend OSINT Proxy)
        // This hits the Universal OSINT proxy we created to safely fetch external data without CORS issues.
        try {
            const feedKey = "${id.toUpperCase()}";
            const response = await fetch(\`/api/osint/\${feedKey}\`);
            if (!response.ok) return [];
            
            // Raw data bypass (in a real scenario, map this to GeoEntity[])
            const data = await response.json();
            return []; // Return empty array for now since UI rendering is omitted per instructions
        } catch (error) {
            return [];
        }
    }

    getLayerConfig() {
        return {
            color: "${def.color}",
            clusterEnabled: true,
            clusterDistance: 50
        };
    }

    renderEntity(entity: GeoEntity) {
        return {
            type: "point" as const,
            color: "${def.color}",
            size: 8
        };
    }
}

export default Osint${id.charAt(0).toUpperCase() + id.slice(1)}Plugin;
`;

    fs.writeFileSync(
        path.join(pluginDir, 'index.ts'),
        indexTs.trim() + '\\n'
    );
});

console.log('Successfully generated 20+ headless OSINT plugins from Godseye definitions.');
