# Sarvakshan OSINT Command Center

Sarvakshan is an advanced, terminal-based visual dashboard for gathering and displaying live Open-Source Intelligence (OSINT). It processes external data sources, normalizes them, and renders them directly inside your CLI.

## Features

- **Global Intel Map**: Real-time plotting of data points (events, aircraft, cameras) on an interactive ASCII world map.
- **Coordinate Scatter**: Real-time geospatial mathematical distribution plotting.
- **Media Feed Processor**: The terminal engine integrates `terminal-image` to download CCTV or photographic intelligence and renders it inline inside the CLI as high-resolution ANSI pixels.
- **Aircraft Tracking & Parsing**: Dedicated parsers for ADS-B Live and OpenSky Network APIs to plot live, dynamic flight coordinates.
- **Dynamic Logging System**: An integrated error-tracking system for all background API health-check operations.
- **Human-Readable Formats**: All APIs are normalized from JSON/CSV blobs to simple table headers.

[![CI Build](https://github.com/Aditya and Mankshu/Sarvakshan/actions/workflows/ci.yml/badge.svg)](https://github.com/Aditya and Mankshu/Sarvakshan/actions/workflows/ci.yml)
[![Codecov](https://img.shields.io/codecov/c/github/Aditya and Mankshu/Sarvakshan.svg)](https://codecov.io/gh/Aditya and Mankshu/Sarvakshan)
[![NPM Version](https://img.shields.io/npm/v/@Sarvakshan/wwv-plugin-sdk.svg)](https://www.npmjs.com/package/@Sarvakshan/wwv-plugin-sdk)
[![GitHub Release](https://img.shields.io/github/v/release/Aditya and Mankshu/Sarvakshan?sort=semver)](https://github.com/Aditya and Mankshu/Sarvakshan/releases)
[![Contributors](https://img.shields.io/github/contributors/Aditya and Mankshu/Sarvakshan.svg)](https://github.com/Aditya and Mankshu/Sarvakshan/graphs/contributors)
<br>
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![CesiumJS](https://img.shields.io/badge/Cesium-JS-4272D0)](https://cesium.com/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

## Installation & Setup

1. Install all dependencies across the monorepo:
   ```bash
   pnpm install
   ```

2. Boot the API backend server:
   ```bash
   pnpm run dev
   ```

3. Open a second terminal window and boot the Command Center:
   ```bash
   pnpm run terminal
   ```

## Key Bindings (Dashboard)

- **[d]** - Select active OSINT Dataset
- **[T]** - Focus Main Data Table (use Up/Down arrows and Enter)
- **[e]** - Toggle detailed Error Logs Modal
- **[r]** - Force refresh current dataset
- **[Enter]** - (When focused on Data Table) Executes row action:
  - If CCTV/Image: Fetches media and renders to Media Processor.
  - If Aviation/Military: Triggers vector projection simulation.
- **[q] / [Esc]** - Quit or close open modal.

## Architecture

The stack relies on a **Next.js 15+ App Router** as an API proxy (`src/app/api/osint/[feed]/route.ts`) to avoid CORS, enforce caching, and parse disparate data formats (CSV, GeoJSON, standard JSON arrays, OpenSky Arrays).

The front-end Terminal UI (`packages/sarvakshan-cli/index.js`) is constructed using `blessed`, `blessed-contrib`, and `terminal-image`.
