/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db", () => {
    const mockPrisma = {
        installedPlugin: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            updateMany: vi.fn(),
            deleteMany: vi.fn(),
        },
    };
    return { prisma: mockPrisma };
});

import { prisma } from "../db";
import {
    getInstalledPlugins,
    isInstalled,
    upsertPlugin,
    uninstallPlugin,
    disablePlugin,
    enablePlugin,
    getDisabledPluginIds,
} from "./repository";

const mockInstalledPlugin = prisma.installedPlugin as unknown as {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
};

describe("Marketplace Repository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getInstalledPlugins", () => {
        it("returns all installed plugins ordered by date", async () => {
            const plugins = [{ pluginId: "aviation", version: "1.0.0" }];
            mockInstalledPlugin.findMany.mockResolvedValue(plugins);

            const result = await getInstalledPlugins();
            expect(result).toEqual(plugins);
            expect(mockInstalledPlugin.findMany).toHaveBeenCalledWith({
                orderBy: { installedAt: "desc" },
            });
        });
    });

    describe("isInstalled", () => {
        it("returns true when plugin exists", async () => {
            mockInstalledPlugin.findFirst.mockResolvedValue({ pluginId: "aviation" });
            expect(await isInstalled("aviation")).toBe(true);
        });

        it("returns false when plugin not found", async () => {
            mockInstalledPlugin.findFirst.mockResolvedValue(null);
            expect(await isInstalled("unknown")).toBe(false);
        });
    });

    describe("upsertPlugin", () => {
        it("creates a plugin record if not existing", async () => {
            const result = { pluginId: "wildfire", version: "1.0.0", config: "{}", enabled: true };
            mockInstalledPlugin.findFirst.mockResolvedValue(null);
            mockInstalledPlugin.create.mockResolvedValue(result);

            const out = await upsertPlugin("wildfire", "1.0.0");
            expect(out).toEqual(result);
            expect(mockInstalledPlugin.create).toHaveBeenCalledWith({
                data: { pluginId: "wildfire", version: "1.0.0", config: "{}", enabled: true },
            });
        });

        it("updates a plugin record if existing", async () => {
            const existing = { pluginId: "wildfire", version: "0.9.0", config: "{}" };
            const result = { pluginId: "wildfire", version: "1.0.0", config: '{"format":"static"}', enabled: true };
            mockInstalledPlugin.findFirst.mockResolvedValueOnce(existing).mockResolvedValueOnce(result);
            mockInstalledPlugin.updateMany.mockResolvedValue({ count: 1 });

            const out = await upsertPlugin("wildfire", "1.0.0", '{"format":"static"}');
            expect(out).toEqual(result);
            expect(mockInstalledPlugin.updateMany).toHaveBeenCalledWith({
                where: { pluginId: "wildfire" },
                data: { version: "1.0.0", config: '{"format":"static"}', enabled: true },
            });
        });
    });

    describe("uninstallPlugin", () => {
        it("deletes existing plugin and returns 1", async () => {
            mockInstalledPlugin.deleteMany.mockResolvedValue({});

            const result = await uninstallPlugin("wildfire");
            expect(result).toBe(1);
            expect(mockInstalledPlugin.deleteMany).toHaveBeenCalledWith({ where: { pluginId: "wildfire" } });
        });

        it("returns 0 if plugin not installed", async () => {
            mockInstalledPlugin.deleteMany.mockRejectedValue(new Error("Not found"));
            const result = await uninstallPlugin("unknown");
            expect(result).toBe(0);
        });
    });

    describe("disablePlugin", () => {
        it("updates with enabled=false if existing", async () => {
            const existing = { pluginId: "aviation" };
            mockInstalledPlugin.findFirst.mockResolvedValueOnce(existing).mockResolvedValueOnce({ pluginId: "aviation", enabled: false });
            mockInstalledPlugin.updateMany.mockResolvedValue({ count: 1 });

            await disablePlugin("aviation");
            expect(mockInstalledPlugin.updateMany).toHaveBeenCalledWith({
                where: { pluginId: "aviation" },
                data: { enabled: false },
            });
        });
        
        it("creates with enabled=false if not existing", async () => {
            mockInstalledPlugin.findFirst.mockResolvedValue(null);
            
            await disablePlugin("aviation");
            expect(mockInstalledPlugin.create).toHaveBeenCalledWith({
                data: { pluginId: "aviation", version: "built-in", config: "{}", enabled: false },
            });
        });
    });

    describe("enablePlugin", () => {
        it("updates with enabled=true", async () => {
            mockInstalledPlugin.updateMany.mockResolvedValue({ count: 1 });

            await enablePlugin("aviation");
            expect(mockInstalledPlugin.updateMany).toHaveBeenCalledWith({
                where: { pluginId: "aviation" },
                data: { enabled: true },
            });
        });
    });

    describe("getDisabledPluginIds", () => {
        it("returns set of disabled plugin IDs", async () => {
            mockInstalledPlugin.findMany.mockResolvedValue([
                { pluginId: "aviation" },
                { pluginId: "maritime" },
            ]);

            const result = await getDisabledPluginIds();
            expect(result).toEqual(new Set(["aviation", "maritime"]));
            expect(mockInstalledPlugin.findMany).toHaveBeenCalledWith({
                where: { enabled: false },
                select: { pluginId: true },
            });
        });
    });
});
