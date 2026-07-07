/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type {
  WorldPlugin,
  GeoEntity,
  TimeRange,
  PluginContext,
  LayerConfig,
  CesiumEntityOptions,
  ServerPluginConfig,
} from "@Sarvakshan/wwv-plugin-sdk";
import { mapCryptoTradePayload, type CoinCapTrade } from "./cryptoMapper";

// ─── Colour palette ────────────────────────────────────────────────────────────
// Buy → amber-gold spectrum  |  Sell → cyan-blue spectrum
// Intensity (0–1) drives the alpha so whale trades glow brighter.

function tradeColor(isBuy: boolean, intensity: number): string {
  const alpha = Math.max(0.35, Math.min(1, 0.35 + intensity * 0.65));
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return isBuy ? `#f59e0b${a}` : `#22d3ee${a}`;
}

// ─── CryptoTradePlugin ─────────────────────────────────────────────────────────

/**
 * World Crypto Trades plugin.
 *
 * Architecture: All-Bundle / WebSocket firehose.
 *
 * The core WsClient resolves the engine URL via `getServerConfig().streamUrl`,
 * opening a direct connection to `wss://ws.coincap.io/trades/binance`.
 * Every incoming message is routed through `mapWebsocketPayload`, which
 * converts the raw CoinCap payload into a `GeoEntity` and hands it to the
 * DataBus → Store → EntityRenderer pipeline.
 *
 * No core engine files (GlobeView, WsClient, stores) are modified.
 */
export class CryptoTradePlugin implements WorldPlugin {
  id = "crypto-trade";
  name = "World Crypto Trades";
  description =
    "Tracks the entire crypto market in real-time, mapping live Binance trades to major global exchange hubs.";
  icon = "bitcoin";
  category = "economic" as const;
  version = "1.0.0";

  private context: PluginContext | null = null;

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  async initialize(ctx: PluginContext): Promise<void> {
    this.context = ctx;
  }

  destroy(): void {
    this.context = null;
  }

  // ─── Data ────────────────────────────────────────────────────────────────────

  /**
   * No REST polling — all data comes via the WebSocket firehose.
   * Returning an empty array keeps the polling manager satisfied
   * without triggering any network requests.
   */
  async fetch(_timeRange: TimeRange): Promise<GeoEntity[]> {
    return [];
  }

  /** Polling disabled — data is pushed via WebSocket. */
  getPollingInterval(): number {
    return 0;
  }

  /**
   * Declares the direct CoinCap WebSocket URL.
   * `resolveEngineUrl` in DataBusSubscriber picks this up so the WsClient
   * connects to CoinCap instead of the internal data engine.
   */
  getServerConfig(): ServerPluginConfig {
    return {
      apiBasePath: "/api/plugins/crypto-trade",
      pollingIntervalMs: 0,
      streamUrl: "wss://ws.coincap.io/trades/binance",
    };
  }

  // ─── WebSocket Payload Mapping ────────────────────────────────────────────────

  /**
   * Called by WsClient.handleDataMessage() for every incoming frame.
   *
   * CoinCap pushes individual trade objects (not arrays), so we map the
   * single trade to one GeoEntity and prepend it to the rolling window of
   * existing entities, capping at 2 000 to stay within GPU budget.
   */
  mapWebsocketPayload(
    payload: CoinCapTrade | CoinCapTrade[],
    existingEntities: GeoEntity[] = []
  ): GeoEntity[] {
    const trades = Array.isArray(payload) ? payload : [payload];

    const newEntities: GeoEntity[] = [];
    for (const trade of trades) {
      // Guard: skip malformed frames missing required numeric fields
      if (
        typeof trade.priceUsd !== "number" ||
        typeof trade.volume !== "number" ||
        typeof trade.timestamp !== "number"
      ) {
        continue;
      }
      newEntities.push(mapCryptoTradePayload(trade, this.id));
    }

    // Keep a rolling window — newest trades at the front
    const combined = [...newEntities, ...existingEntities];
    return combined.slice(0, 2000);
  }

  // ─── Rendering ───────────────────────────────────────────────────────────────

  getLayerConfig(): LayerConfig {
    return {
      color: "#f59e0b",
      clusterEnabled: true,
      clusterDistance: 60,
      maxEntities: 2000,
    };
  }

  /**
   * Renders each trade as a billboard.
   * - Scale grows with intensity so "whale" trades dominate the visual field.
   * - Buys are amber-gold; sells are cyan-blue.
   * - Depth bias pulls all billboards above terrain.
   */
  renderEntity(entity: GeoEntity): CesiumEntityOptions {
    const intensity = (entity.properties.intensity as number) ?? 0;
    const isBuy = entity.properties.isBuy as boolean;

    // Icon scale: 0.3 (small retail trade) → 1.2 (whale trade)
    const iconScale = 0.3 + intensity * 0.9;

    return {
      type: "billboard",
      iconUrl: isBuy
        ? "/icons/crypto-buy.svg"
        : "/icons/crypto-sell.svg",
      color: tradeColor(isBuy, intensity),
      iconScale,
      depthBias: -2000,
      disableDepthTestDistance: 1e10,
    };
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────
// The PluginRegistry in AppShell.tsx expects a constructed WorldPlugin instance.
export const cryptoTradePlugin = new CryptoTradePlugin();
export default cryptoTradePlugin;
