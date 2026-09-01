# 🛡️ SARVAKSHAN — All-Inclusive OSINT, GeoINT & Darknet Multi-INT Fusion Platform

> **Palantir-Scale Multi-INT Intelligence Architecture**  
> Unifying Person OSINT, Geotagged Social Media, SOCKS5 Darknet Crawling, Public Records (960+ Sources), Infrastructure Geolocation, 4D Spatial-Temporal Analytics, and Confidential Intelligence Dossiers.

---

## 🎯 Platform Overview

**Sarvakshan** is an **All-Inclusive Intelligence Fusion Platform** designed for security analysts, threat intelligence researchers, and tactical operators.

By coupling a **Python Intelligence Processing Core** (`python/sarvakshan_core/`) with a **4D Geospatial Projection Canvas** (Latitude, Longitude, Altitude, Time), Sarvakshan maps every digital and darknet trace directly to physical geographic space to synthesize automated **Confidential Intelligence Analysis Dossiers**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│              SARVAKSHAN ALL-INCLUSIVE FUSION ENGINE (PYTHON CORE ENGINE)                │
└─────────────────────────────────────────────────────────────────────────────────────────┘
   │
   ├─► 1. VISUAL ENTITY LINK ANALYSIS (python/sarvakshan_core/link_graph_engine.py)
   │   └─► Interactive Node Graph ──► Geospatial Node Coordinates & Co-location Edges
   │
   ├─► 2. SOCIAL MEDIA & GEOTAGGED MEDIA (python/sarvakshan_core/social_media_harvester.py)
   │   └─► Profile & Post Miner ──► Photo EXIF, Story Check-ins, Geotagged Media & Graph
   │
   ├─► 3. DARKNET & .ONION CRAWLER ENGINE (python/sarvakshan_core/darknet_crawler.py)
   │   └─► Isolated SOCKS5 Crawler ──► Scraped .Onion Links, Emails, Crypto, & Geo-Mentions
   │
   ├─► 4. AUTOMATED WEB & EXIF RECON ENGINE (python/sarvakshan_core/automated_recon.py)
   │   └─► Modular Scrapers ──► Scraped EXIF Media, Registrant Addr & Regional Leaks
   │
   ├─► 5. ASSET & INFRASTRUCTURE GEOLOCATOR (python/sarvakshan_core/infrastructure_geolocator.py)
   │   └─► IoT / IP / Server Banners ──► Physical Datacenter Points & ISP Infrastructure
   │
   ├─► 6. PUBLIC RECORDS HARVESTER ENGINE (python/sarvakshan_core/public_records_harvester.py)
   │   └─► 960+ Source Deep Search ──► Geocoded Public Records & Social Location Tags
   │
   └─► 7. SPATIAL CLUSTERING & POL ENGINE (python/sarvakshan_core/spatial_clustering.py)
       └─► Scikit-Learn DBSCAN ──► Pattern-of-Life Anchors & Transit Velocity Vectors
```

---

## ⚡ Key Capabilities & Native Engines

### 1. Visual Entity Link Analysis Engine
* Interactive node-edge entity graph mapping (Person, Email, Phone, Domain, IP, Location, Social Handle).
* Direct bi-directional synchronization between graph nodes and 4D map coordinates.

### 2. Social Media & Geotagged Media Mining Engine
* Scrapes target social profiles, posts, tagged media, story locations, and follower networks.
* Parses EXIF metadata (`Pillow`, `exifread`) to extract GPS coordinates (Lat/Long/Alt) and camera specifications.

### 3. Darknet & .Onion Hidden Service Crawler Engine
* Isolated SOCKS5 proxy crawler (`PySocks`, `stem`) querying `.onion` hidden services recursively.
* Regex & NLP extraction of PGP keys, BTC/XMR crypto addresses, exposed emails, and darknet geographic mentions.

### 4. Public Records & Identifier Harvester Engine
* Reverse handle, email, phone, and public record lookup across 960+ sources.
* Automated address extraction and geocoding into physical map coordinates.

### 5. Asset & Infrastructure Geolocation Engine
* Maps target IP subnets, open ports, IoT devices, and BGP ASNs to exact physical datacenter coordinates and ISP cell tower footprints.

### 6. Spatial-Temporal Pattern of Life (PoL) Analytics Engine
* Implements **DBSCAN spatial clustering** (`scikit-learn`, `numpy`, `geopy`) to extract Primary Residence Anchors, Workplace HQ, and Transit Hubs.
* Transit velocity vector verification between consecutive spatial points to detect travel modes and filter invalid data jumps.

### 7. Pre-Flight API & Function Check Event System
* Pre-flight health verification running before any API request or Python function executes to ensure DB connectivity, proxy readiness, and module integrity.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v20.x or higher
- **pnpm**: v9.x or higher
- **Python**: v3.10+ (with `requests`, `scikit-learn`, `numpy`, `geopy`)

### 1. Installation & Environment Setup
```bash
# Clone repository
git clone https://github.com/himanshu-anonymous/Sarvakshan.git
cd Sarvakshan

# Install dependencies
pnpm install

# Run database setup & Prisma generation
pnpm run setup
```

### 2. Launch Next.js Web Visual Workspace
```bash
pnpm dev
```
Open **`http://localhost:3000/osint-fusion`** to access the full-screen Multi-INT Web Visual Workspace.

### 3. Launch Terminal TUI Command Center
```bash
pnpm terminal
# or node packages/sarvakshan-cli/index.js
```

#### TUI Hotkeys:
* **`[o]`**: Switch to **Target OSINT Fusion Mode**
* **`[s]`**: Execute live **Python Target Intelligence Scan**
* **`[w]`**: **Redirect & Open Web Visual Workspace** (`http://localhost:3000/osint-fusion?target=[id]&ip=[ip]`)
* **`[g]`**: Synthesize **Confidential Intelligence Dossier**
* **`[d]`**: Select Dataset Feed
* **`[e]`**: View Error & System Logs
* **`[q]`**: Quit TUI

---

## 🛠️ Python Core CLI Commands

Execute Python intelligence modules directly from the command line:

```bash
# Run Target Enrichment Scan
python -m python.sarvakshan_core.cli --action enrich_target --payload "eyJuYW1lIjogIlN1YmplY3QgQWxwaGEifQ=="

# Run Pre-flight Health Check
python -m python.sarvakshan_core.cli --action preflight_check

# Generate Confidential Dossier
python -m python.sarvakshan_core.cli --action generate_dossier --payload "eyJuYW1lIjogIlN1YmplY3QgQWxwaGEifQ=="
```

---

## 📂 Repository Structure

```
Sarvakshan/
├── FUTURE_COURSE_OF_ACTION.md        # Complete engineering roadmap for contributors
├── README.md                         # Main platform documentation
├── packages/
│   └── sarvakshan-cli/              # Terminal TUI Command Center (blessed/contrib)
├── python/
│   └── sarvakshan_core/             # Native Python OSINT, GeoINT & Darknet Engines
│       ├── social_media_harvester.py # Social & EXIF Geotag Miner
│       ├── darknet_crawler.py        # Tor SOCKS5 .Onion Crawler
│       ├── public_records_harvester.py # 960+ Public Records Harvester
│       ├── infrastructure_geolocator.py # Asset & IP Datacenter Geolocator
│       ├── automated_recon.py        # Web Recon & EXIF Parser
│       ├── link_graph_engine.py      # Visual Link Analysis Engine
│       ├── spatial_clustering.py     # DBSCAN Pattern of Life Engine
│       ├── dossier_generator.py      # Confidential Dossier Synthesizer
│       ├── preflight_check.py        # Pre-Flight Function Verifier
│       └── cli.py                    # CLI Bridge Runner
├── src/
│   ├── app/
│   │   ├── api/osint-fusion/        # Next.js API Routes (Targets, Dossiers, Graph)
│   │   └── osint-fusion/            # Web Visual Workspace Page
│   ├── components/
│   │   └── panels/TargetOsintPanel.tsx # Target Multi-INT HUD Component
│   └── lib/
│       └── osint-fusion/            # TypeScript Python Bridge & Pre-Flight Event Middleware
└── prisma/
    └── schema.prisma                # Database Schema (Targets, GeoTracks, Darknet, Dossiers)
```

---

## 🛡️ Security & Privacy Notice
- All target profiling data processed within Sarvakshan is restricted to local/isolated databases.
- Darknet crawling must operate over isolated SOCKS5 proxies with proper anonymity controls.
- Generated intelligence reports include strict security headers (`CONFIDENTIAL // RESTRICTED RESEARCH`).
