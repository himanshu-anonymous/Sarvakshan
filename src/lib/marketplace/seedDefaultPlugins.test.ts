/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

const mockFindFirst = vi.fn();
const mockCount = vi.fn();
const mockUpdateMany = vi.fn();
const mockCreate = vi.fn();

vi.mock("../db", () => ({
    prisma: {
        setting: {
            findFirst: (...a: any[]) => mockFindFirst(...a),
            updateMany: (...a: any[]) => mockUpdateMany(...a),
            create: (...a: any[]) => mockCreate(...a),
        },
        installedPlugin: { count: (...a: any[]) => mockCount(...a) },
    },
}));

const mockUpsertPlugin = vi.fn();
vi.mock("./repository", () => ({ upsertPlugin: (...a: any[]) => mockUpsertPlugin(...a) }));

const mockValidateManifest = vi.fn();
vi.mock("@/core/plugins/validateManifest", () => ({
    validateManifest: (...a: any[]) => mockValidateManifest(...a),
}));

const mockGetVerifiedPluginIds = vi.fn();
vi.mock("./registryClient", () => ({
    getVerifiedPluginIds: (...a: any[]) => mockGetVerifiedPluginIds(...a),
}));

let mockIsDemo = false;
vi.mock("@/core/edition", () => ({ get isDemo() { return mockIsDemo; } }));

// Mock global fetch for marketplace API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { seedDefaultPlugins } from "./seedDefaultPlugins";
import { DEFAULT_PLUGIN_IDS } from "./defaultPlugins";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fakeManifest(id: string) {
    return {
        id,
        name: id,
        version: "1.0.0",
        format: "bundle",
        entry: `https://unpkg.com/wwv-plugin-${id}@1.0.0/dist/frontend.mjs`,
        npmPackage: `wwv-plugin-${id}`,
        rendering: { type: "point", color: "#ff0000", size: 6 },
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("seedDefaultPlugins", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsDemo = false;
        delete process.env.WWV_SKIP_DEFAULT_PLUGINS;

        // Defaults: not seeded, no existing plugins, manifests valid
        mockFindFirst.mockResolvedValue(null);
        mockCount.mockResolvedValue(0);
        mockGetVerifiedPluginIds.mockResolvedValue(new Set(DEFAULT_PLUGIN_IDS));
        mockValidateManifest.mockReturnValue({ valid: true, errors: [] });
        mockUpsertPlugin.mockResolvedValue({});
        mockCreate.mockResolvedValue({});
        mockUpdateMany.mockResolvedValue({});

        mockFetch.mockImplementation(async (url: string) => ({
            ok: true,
            json: async () => {
                const match = url.match(/plugins\/(.+)$/);
                return match ? fakeManifest(match[1]) : {};
            },
        }));
    });

    it("seeds all default plugins on a fresh install", async () => {
        await seedDefaultPlugins();

        expect(mockUpsertPlugin).toHaveBeenCalledTimes(DEFAULT_PLUGIN_IDS.length);
        for (const id of DEFAULT_PLUGIN_IDS) {
            expect(mockUpsertPlugin).toHaveBeenCalledWith(
                id,
                "1.0.0",
                expect.stringContaining(`"id":"${id}"`),
            );
        }

        // Guard row written
        expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { key: "defaults_seeded", value: "true" },
            }),
        );
    });

    it("skips immediately when already seeded", async () => {
        mockFindFirst.mockResolvedValue({ key: "defaults_seeded", value: "true" });

        await seedDefaultPlugins();

        expect(mockUpsertPlugin).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("marks seeded without installing when plugins already exist", async () => {
        mockCount.mockResolvedValue(3);

        await seedDefaultPlugins();

        expect(mockUpsertPlugin).not.toHaveBeenCalled();
        // Guard row still written
        expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { key: "defaults_seeded", value: "true" },
            }),
        );
    });

    it("handles marketplace API failure gracefully", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"));

        await seedDefaultPlugins();

        // Should NOT throw
        expect(mockUpsertPlugin).not.toHaveBeenCalled();
        // Guard row still written (fail-safe)
        expect(mockCreate).toHaveBeenCalled();
    });

    it("skips when WWV_SKIP_DEFAULT_PLUGINS=true", async () => {
        process.env.WWV_SKIP_DEFAULT_PLUGINS = "true";

        await seedDefaultPlugins();

        expect(mockUpsertPlugin).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
        // Guard row written so it doesn't re-check
        expect(mockCreate).toHaveBeenCalled();
    });

    it("skips entirely on demo edition", async () => {
        mockIsDemo = true;

        await seedDefaultPlugins();

        expect(mockUpsertPlugin).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it("skips individual plugins with invalid manifests", async () => {
        // Make the first plugin fail validation
        let callCount = 0;
        mockValidateManifest.mockImplementation(() => {
            callCount++;
            if (callCount === 1) return { valid: false, errors: ["missing field"] };
            return { valid: true, errors: [] };
        });

        await seedDefaultPlugins();

        // One fewer than total (the first was skipped)
        expect(mockUpsertPlugin).toHaveBeenCalledTimes(DEFAULT_PLUGIN_IDS.length - 1);
    });

    it("stamps trust from the verified registry", async () => {
        const firstId = DEFAULT_PLUGIN_IDS[0];
        // Only the first plugin is verified
        mockGetVerifiedPluginIds.mockResolvedValue(new Set([firstId]));

        await seedDefaultPlugins();

        // Check the first call has "verified"
        const firstCall = mockUpsertPlugin.mock.calls[0];
        expect(firstCall[0]).toBe(firstId);
        const firstManifest = JSON.parse(firstCall[2]);
        expect(firstManifest.trust).toBe("verified");

        // Check a non-verified one
        const secondCall = mockUpsertPlugin.mock.calls[1];
        const secondManifest = JSON.parse(secondCall[2]);
        expect(secondManifest.trust).toBe("unverified");
    });
});
