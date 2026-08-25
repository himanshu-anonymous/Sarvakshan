import { WorldPlugin, PluginContext, GeoEntity } from "@Sarvakshan/wwv-plugin-sdk";
import { Layers } from "lucide-react";

export class OsintDisastersPlugin implements WorldPlugin {
    id = "osint-disasters";
    name = "DISASTERS";
    description = "Global disaster incidents and alerts.";
    icon = Layers;
    category = "intelligence" as any;
    version = "1.0.0";

    private ctx!: PluginContext;

    async initialize(ctx: PluginContext) {
        this.ctx = ctx;
        console.log(`[${this.name}] Headless OSINT plugin initialized.`);
    }

    destroy() {
        console.log(`[${this.name}] Destroyed.`);
    }

    getPollingInterval() {
        return 180000;
    }

    async fetch(timeRange: { start: Date; end: Date }): Promise<GeoEntity[]> {
        // Functionality ported from Godseye (Backend OSINT Proxy)
        // This hits the Universal OSINT proxy we created to safely fetch external data without CORS issues.
        try {
            const feedKey = "DISASTERS";
            const response = await fetch(`/api/osint/${feedKey}`);
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
            color: "#ff6f61",
            clusterEnabled: true,
            clusterDistance: 50
        };
    }

    renderEntity(entity: GeoEntity) {
        return {
            type: "point" as const,
            color: "#ff6f61",
            size: 8
        };
    }
}

export default OsintDisastersPlugin;\n