/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

/** Global type declarations for the Umami analytics tracker script. */
interface UmamiTracker {
    track(event: string, data?: Record<string, string | number | boolean>): void;
    track(callback: (props: Record<string, unknown>) => Record<string, unknown>): void;
    track(): void;
    identify(uniqueId: string, data?: Record<string, unknown>): void;
    identify(data: Record<string, unknown>): void;
}

interface Window {
    umami?: UmamiTracker;
}
