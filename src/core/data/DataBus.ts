/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type { DataBusEvents } from "@/core/plugins/PluginTypes";

type EventHandler<T> = (data: T) => void;

/**
 * Typed event bus for cross-component and cross-plugin communication.
 * Singleton pattern — import and use directly.
 */
class DataBus {
    private listeners: Map<string, Set<EventHandler<unknown>>> = new Map();

    on<K extends keyof DataBusEvents>(
        event: K,
        handler: EventHandler<DataBusEvents[K]>
    ): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler as EventHandler<unknown>);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(handler as EventHandler<unknown>);
        };
    }

    emit<K extends keyof DataBusEvents>(event: K, data: DataBusEvents[K]): void {
        this.listeners.get(event)?.forEach((handler) => {
            try {
                handler(data);
            } catch (err) {
                console.error(`[DataBus] Error in handler for "${event}":`, err);
            }
        });
    }

    off<K extends keyof DataBusEvents>(
        event: K,
        handler: EventHandler<DataBusEvents[K]>
    ): void {
        this.listeners.get(event)?.delete(handler as EventHandler<unknown>);
    }

    removeAllListeners(event?: keyof DataBusEvents): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

export const dataBus = new DataBus();
