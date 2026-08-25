# Sarvakshan OSINT Command Center

Sarvakshan is an advanced, terminal-based visual dashboard for gathering and displaying live Open-Source Intelligence (OSINT). It processes external data sources, normalizes them, and renders them directly inside your CLI.

<div align="center">
  <h1>🌐 Sarvakshan OSINT Command Center</h1>
  <p>An advanced, high-performance terminal dashboard for gathering, visualizing, and analyzing live Open-Source Intelligence.</p>
</div>

![Dashboard Overview](docs/assets/dashboard_overview.png)
*(Placeholder: Add a screenshot of the main CLI dashboard here)*

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Installation & Quickstart](#-installation--quickstart)
- [Dashboard Controls](#-dashboard-controls)
- [Data Sources & APIs](#-data-sources--apis)
- [Architecture](#-architecture)

---

## 🎯 Overview

Sarvakshan bypasses standard web interfaces, dropping you directly into a hacker-style Terminal User Interface (TUI). It acts as a massive data aggregator, pulling in live intelligence from dozens of global APIs including NASA, USGS, aviation networks, and international traffic camera systems.

---

## ✨ Key Features

1. **Global Intel Map (ASCII Geo-Spatial Projection)**
   - Real-time plotting of earthquakes, military bases, and aircraft directly onto an interactive ASCII terminal map.
   
2. **Terminal Media Processor**
   - Integrates `terminal-image` to download CCTV traffic feeds or photographic intelligence and mathematically converts the pixel buffers into high-resolution ANSI blocks rendered inline.
   
   ![Media Processor Example](docs/assets/media_processor.png)
   *(Placeholder: Add a screenshot of an ANSI image rendering in the terminal)*

3. **Coordinate Scatter Analytics**
   - Plots the geographical dispersion (Longitude vs Latitude) of active data points using an integrated `blessed-contrib` line chart engine.
   
4. **Dedicated Aviation Parsing**
   - Advanced nested-array parsers capable of unpacking live `ADS-B Exchange` and `OpenSky Network` flight vectors on the fly.

5. **Integrated Background Diagnostics**
   - An isolated system log viewer (`Puffin Log Viewer`) that intercepts `console` output to report real-time API health checks, rendering errors, and polling events.

---

## 🚀 Installation & Quickstart

Sarvakshan is designed as a monorepo. The backend operates on Next.js, while the frontend CLI runs purely on Node.js.

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Boot the API Proxy Server (Required to bypass CORS and normalize payloads)
pnpm run dev

# 3. Open a second terminal window and launch the OSINT Command Center
pnpm run terminal
```

---

## 🎮 Dashboard Controls

The dashboard is completely keyboard-driven:

| Key Binding | Action |
|-------------|--------|
| **`d`** | Opens the **Dataset Selection Modal** to switch OSINT feeds. |
| **`T`** | Forces focus onto the **Main Data Table** (use Up/Down arrows to navigate). |
| **`Enter`** | Executes the selected row. Automatically triggers CCTV image rendering or plots flight path vector simulations. |
| **`e`** | Opens the **Detailed Error Logs** modal. Press `Enter` on any log to view the full stack trace. |
| **`r`** | Forces an immediate manual refresh/polling of the active feed. |
| **`q`** / **`Esc`** | Safely exits the active modal or shuts down the Command Center. |

---

## 📡 Data Sources & APIs

The system automatically scans `src/lib/godseye/constants/dataSources.ts` on boot to dynamically load supported APIs. Feed examples include:
- **USGS Earthquakes (24h)**
- **NASA FIRMS Fire Hotspots**
- **Global Airplanes (ADS-B)**
- **OpenSky Network Flights**
- **London TfL & Ontario 511 Cameras**
- **Smithsonian Volcanoes**

---

## 🏗 Architecture

The stack is composed of two primary layers:

1. **The API Proxy Layer (`src/app/api/osint/[feed]/route.ts`)**
   - Next.js 15+ App Router endpoints that safely fetch payloads on behalf of the CLI. Prevents terminal blocking and resolves external API timeout issues via rapid `HEAD` checks.

2. **The Terminal Engine (`packages/sarvakshan-cli/index.js`)**
   - Built on `blessed` and `blessed-contrib`. Dynamically switches parsing algorithms (CSV vs GeoJSON vs OpenSky Arrays) based on the payload signature.
