/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import type { GeoEntity } from "@Sarvakshan/wwv-plugin-sdk";

// ─── Exchange Hub Registry ─────────────────────────────────────────────────────
// Geographic coordinates (longitude, latitude) for major global crypto exchange
// server infrastructure hubs. Trades are mapped to the nearest plausible hub
// to create a visual representation of global financial flow on the 3D globe.

interface ExchangeHub {
  name: string;
  lon: number;
  lat: number;
}

export const EXCHANGE_HUBS: Record<string, ExchangeHub> = {
  TOKYO: { name: "Tokyo", lon: 139.6917, lat: 35.6895 },
  LONDON: { name: "London", lon: -0.1276, lat: 51.5074 },
  NEW_YORK: { name: "New York", lon: -74.006, lat: 40.7128 },
  SINGAPORE: { name: "Singapore", lon: 103.8198, lat: 1.3521 },
  FRANKFURT: { name: "Frankfurt", lon: 8.6821, lat: 50.1109 },
  CHICAGO: { name: "Chicago", lon: -87.6298, lat: 41.8781 },
};

const HUB_LIST = Object.values(EXCHANGE_HUBS);

// ─── Stable Hub Assignment ─────────────────────────────────────────────────────
// Deterministically assign a hub to a trading pair so the same asset always
// appears near the same city — creating recognizable, consistent visual patterns.
function assignHub(base: string, quote: string): ExchangeHub {
  const key = `${base}:${quote}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return HUB_LIST[hash % HUB_LIST.length];
}

// ─── Geographic Jitter ────────────────────────────────────────────────────────
// Apply a small random offset so concurrent trades don't stack perfectly on
// the same pixel. Max jitter: ±0.8° (~88 km), seeded by timestamp for variety.
function applyJitter(value: number, seed: number, scale: number): number {
  const pseudoRandom = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;
  return value + (pseudoRandom - 0.5) * 2 * scale;
}

// ─── CoinCap Trade Payload ─────────────────────────────────────────────────────
// Raw shape pushed by wss://ws.coincap.io/trades/binance
export interface CoinCapTrade {
  exchange: string;
  base: string;
  quote: string;
  direction: "buy" | "sell";
  price: number;
  volume: number;
  timestamp: number;
  priceUsd: number;
}

// ─── Intensity Thresholds ──────────────────────────────────────────────────────
// USD notional value → visual intensity (0–1 scale) used by renderEntity
// to drive icon scale and colour. Capped at $1M to avoid extreme outliers.
const MAX_NOTIONAL_USD = 1_000_000;

function calcIntensity(priceUsd: number, volume: number): number {
  const notional = Math.abs(priceUsd * volume);
  return Math.min(notional / MAX_NOTIONAL_USD, 1);
}

// ─── Main Mapper ───────────────────────────────────────────────────────────────
/**
 * Maps a raw CoinCap WebSocket trade payload to a GeoEntity.
 *
 * Called once per trade message from the WsClient `handleDataMessage` path
 * via the `mapWebsocketPayload` method on the CryptoTradePlugin class.
 *
 * @param rawPayload - Parsed JSON from the CoinCap WebSocket
 * @param pluginId   - ID of the owning plugin (injected by the plugin class)
 * @returns A single GeoEntity ready for the globe renderer
 */
export function mapCryptoTradePayload(
  rawPayload: CoinCapTrade,
  pluginId: string
): GeoEntity {
  const { base, quote, direction, price, volume, timestamp, priceUsd } =
    rawPayload;

  const hub = assignHub(base, quote);
  const jitterSeed = timestamp ^ (base.charCodeAt(0) * 997);

  const longitude = applyJitter(hub.lon, jitterSeed, 0.8);
  const latitude = applyJitter(hub.lat, jitterSeed ^ 0xdeadbeef, 0.6);

  const intensity = calcIntensity(priceUsd, volume);
  const notionalUsd = priceUsd * volume;

  // Unique ID: combine hub + pair + timestamp to prevent collisions
  const id = `${pluginId}-${base}-${quote}-${timestamp}-${jitterSeed & 0xffff}`;

  return {
    id,
    pluginId,
    latitude,
    longitude,
    timestamp: new Date(timestamp),
    label: `${base.toUpperCase()}/${quote.toUpperCase()}`,
    properties: {
      base,
      quote,
      direction,
      price,
      volume,
      priceUsd,
      notionalUsd,
      intensity,
      hub: hub.name,
      isBuy: direction === "buy",
    },
  };
}
