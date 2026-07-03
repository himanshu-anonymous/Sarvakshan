/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { describe, it, expect } from "vitest";
import { resolveEdition } from "./edition";
import type { Edition } from "./edition";

describe("resolveEdition", () => {
    it("defaults to 'local' when env var is undefined", () => {
        expect(resolveEdition(undefined)).toBe("local");
    });

    it("defaults to 'local' for an empty string", () => {
        expect(resolveEdition("")).toBe("local");
    });

    it("returns 'local' for value 'local'", () => {
        expect(resolveEdition("local")).toBe("local");
    });

    it("returns 'cloud' for value 'cloud'", () => {
        expect(resolveEdition("cloud")).toBe("cloud");
    });

    it("returns 'demo' for value 'demo'", () => {
        expect(resolveEdition("demo")).toBe("demo");
    });

    it("is case-insensitive", () => {
        expect(resolveEdition("CLOUD")).toBe("cloud");
        expect(resolveEdition("Demo")).toBe("demo");
    });

    it("trims whitespace", () => {
        expect(resolveEdition("  cloud  ")).toBe("cloud");
    });

    it("falls back to 'local' for invalid values", () => {
        const invalid: string[] = ["staging", "production", "test", "123"];
        for (const val of invalid) {
            expect(resolveEdition(val)).toBe("local" satisfies Edition);
        }
    });
});

describe("isHistoryEnabled (derived from edition)", () => {
    it("is disabled on demo edition", () => {
        // History unavailable on demo — shared credentials breach the non-transferable ToS clause
        expect(resolveEdition("demo")).toBe("demo");
        // Simulate the flag logic: !isDemo
        const historyEnabled = resolveEdition("demo") !== "demo";
        expect(historyEnabled).toBe(false);
    });

    it("is enabled on local edition", () => {
        const historyEnabled = resolveEdition("local") !== "demo";
        expect(historyEnabled).toBe(true);
    });

    it("is enabled on cloud edition", () => {
        const historyEnabled = resolveEdition("cloud") !== "demo";
        expect(historyEnabled).toBe(true);
    });
});
