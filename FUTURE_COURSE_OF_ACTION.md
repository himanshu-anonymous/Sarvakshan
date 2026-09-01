# 🛡️ SARVAKSHAN — Future Course of Action & Engineering Roadmap
> **Classification**: Internal / Contributors Only  
> **Note**: For Aditya to read  
> **Project Scope**: All-Inclusive OSINT & Geospatial Intelligence (GeoINT) Multi-INT Fusion Platform

---

## 🎯 Executive Vision

Sarvakshan is evolving from a standalone analytics workspace into an **All-Inclusive OSINT & GeoINT Intelligence Fusion Platform**.

By unifying the gold-standard paradigms of modern OSINT—**Visual Link Analysis** (Maltego), **Automated Reconnaissance** (SpiderFoot & Recon-ng), **Asset & Infrastructure Discovery** (Shodan & Censys), **People & Email Intelligence** (Max Intel & 960+ public sources), and **Modular OSINT Taxonomy** (OSINT Framework)—with **Geospatial & Temporal Parameters**, Sarvakshan maps every digital trace directly onto a 4D Spatial-Temporal Canvas (X, Y, Z + Time) to synthesize automated **Confidential Intelligence Analysis Dossiers**.

---

## 🏗️ Core Architecture: OSINT Tool Paradigm & Geospatial Alignment

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SARVAKSHAN OSINT + GEOINT FUSION ARCHITECTURE              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
   │
   ├─► 1. VISUAL LINK ANALYSIS (Maltego Paradigm)
   │   └─► Entity Node Graph ──► Geospatial Node Coordinates & Co-location Edges
   │
   ├─► 2. AUTOMATED RECONNAISSANCE (SpiderFoot & Recon-ng Paradigm)
   │   └─► Modular Scrapers ──► Scraped EXIF Media, Registrant Addr & Regional Leaks
   │
   ├─► 3. ASSET & INFRASTRUCTURE DISCOVERY (Shodan & Censys Paradigm)
   │   └─► IoT / IP / Server Banners ──► Physical Datacenter Points & ISP Infrastructure
   │
   ├─► 4. PEOPLE & EMAIL SEARCH (Max Intel & 960+ Public Sources Paradigm)
   │   └─► 960+ Source Deep Search ──► Geocoded Public Records & Social Location Tags
   │
   └─► 5. TOOL DIRECTORY & TAXONOMY (OSINT Framework Paradigm)
       └─► Transform Pipeline Tree ──► Spatial Transform Taxonomy & 4D Geo Projection
```

---

## 🔬 Detailed Tool Paradigm & Geospatial Parameter Alignment

### 1. Visual Link Analysis Paradigm (*Maltego Alignment*)
* **Core Function**: Interactive entity and connection graph mapping (Person, Email, Phone, IP, Domain, Alias, Location).
* **Geospatial Parameter Alignment**:
  - **Geo-Node Coordinate Mapping**: Convert location and asset nodes directly into interactive Mapbox/Leaflet geographic layers (Lat/Long, GeoJSON Polygons).
  - **Spatial Proximity & Co-Location Edges**: Calculate edge weights based on physical distance between entities and simultaneous spatial-temporal presence.
  - **Graph-to-Map Sync**: Selecting an entity cluster in the link graph automatically filters and highlights its physical spatial footprint on the 4D map canvas.

### 2. Automated Reconnaissance Paradigm (*SpiderFoot & Recon-ng Alignment*)
* **Core Function**: Modular automated data collection, passive/active web reconnaissance, and leak monitoring.
* **Geospatial Parameter Alignment**:
  - **Scraped EXIF & Geotag Harvester**: Automatically extract GPS coordinates, timestamps, and altitude from scraped web images/media.
  - **Registrant & WHOIS Spatial Geocoding**: Geocode physical addresses from WHOIS records, domain filings, and corporate registries.
  - **Regional Sentiment & Exposure Mapping**: Map physical locations mentioned in scraped pastes, forums, and darknet leaks.

### 3. Asset & Infrastructure Discovery Paradigm (*Shodan & Censys Alignment*)
* **Core Function**: Scanning internet-connected devices, open ports, IoT assets, server banners, and SSL certificates.
* **Geospatial Parameter Alignment**:
  - **Physical Device & Datacenter Pinpointing**: Map IP subnets, BGP Autonomous System Numbers (ASNs), and exposed IoT devices to exact physical GPS coordinates and datacenter facilities.
  - **Infrastructure Heatmap Overlay**: Render density maps of target-controlled servers, routers, cameras, and industrial control systems across global regions.
  - **ISP & Cell Tower Triangulation**: Correlate server/device connections with regional internet service provider infrastructure and ground stations.

### 4. People & Email Search Paradigm (*Max Intel & 960+ Public Sources Alignment*)
* **Core Function**: Comprehensive browser-based lookup across 960+ public sources (emails, usernames, public records, court filings, gravatars, social profiles).
* **Geospatial Parameter Alignment**:
  - **Public Record Address Parser**: Extract and geocode physical residential/commercial addresses from public records, voter registries, and court filings.
  - **Social Profile Geo-Normalization**: Normalize unstructured location strings (e.g., *"San Francisco, CA"* -> `[37.7749, -122.4194]`) across 960+ profile sources.
  - **Cross-Source Co-Location Indexing**: Flag target appearance across multiple geographic regions based on email/username hits in regional databases.

### 5. Tool Directory & Modular Taxonomy Paradigm (*OSINT Framework Alignment*)
* **Core Function**: Structured taxonomy of OSINT input types (Domain, IP, Email, Person, Phone, Image, Network) and transform pipelines.
* **Geospatial Parameter Alignment**:
  - **Spatial Transform Taxonomy**: Ensure every branch in the OSINT Framework taxonomy terminates in a **Geospatial Projection Output** (e.g., `Person` -> `Social Profile` -> `Location Tag` -> `Pattern-of-Life Cluster`).
  - **Modular Geo-Pipeline Orchestrator**: Enable analysts to chain OSINT transforms (e.g., `Email` -> `Username` -> `Breach Data` -> `IP` -> `Physical Coordinates`) with real-time spatial projection.

---

## 🚀 Module Breakdown & Contributor Tasks

### Pillar 1: Person OSINT & Public Source Engine ("Max Intel & OSINT Framework")
* [ ] **960+ Source Harvester**: Cross-platform handle/email lookup modules integrating open public record lookup logic.
* [ ] **Public Record Address Parser**: Automated NLP address extraction and geocoding pipeline.
* [ ] **OSINT Framework Taxonomy Integration**: Modular pipeline orchestrator mapping input types to geospatial outputs.

### Pillar 2: Infrastructure & Recon Engine ("Shodan, Censys & SpiderFoot")
* [ ] **Asset Geo-Locator**: Shodan & Censys API integrations to pinpoint target IP/IoT physical infrastructure coordinates.
* [ ] **Automated Recon Scraper**: Modular SpiderFoot/Recon-ng style passive web scanner with automated EXIF media geotag extraction.

### Pillar 3: Visual Link Analysis & Geospatial Map ("Maltego & GeoINT Canvas")
* [ ] **Link Graph Visualizer**: Interactive Cytoscape/Vis.js node-edge visualizer bi-directionally synced with 4D Mapbox map.
* [ ] **Pattern of Life (PoL) Analytics**: **DBSCAN spatial clustering** for Primary Residence Anchor, Workplace HQ, and Transit Hubs.
* [ ] **Velocity & Transit Vector Verification**: Calculate velocity vectors between consecutive spatial points to detect travel modes and filter invalid data jumps.

### Pillar 4: Confidential Analysis & Intelligence Dossier Builder
* [ ] **OPSEC & Threat Scorer**: Rate operational security awareness based on public metadata leakage and infrastructure exposure.
* [ ] **Automated Dossier Generator**: One-click generation of executive intelligence dossiers (`CONFIDENTIAL // RESTRICTED RESEARCH`) downloadable as Markdown/PDF.

---

## 📋 Contributor Task Allocation Matrix

| Component | Responsibility | Primary Lead | Priority | Status |
|---|---|---|---|---|
| **OSINT Collectors & Max Intel** | Handle, email, public record address parser, & 960+ source lookup | Aditya / Contributor | P0 | Planned |
| **Asset & Recon (Shodan/SpiderFoot)** | IP/IoT physical geolocator, EXIF media harvester, & infrastructure scanner | Aditya / Contributor | P0 | Planned |
| **Maltego-Style Graph & 4D Map** | Synced link graph canvas + Mapbox time-slider trajectory workspace | Core Team | P1 | Planned |
| **Intel Synthesis & Dossiers** | OPSEC scoring, anomaly alerts, & PDF dossier engine | Core Team | P1 | Planned |

---

## 🛡️ Security & Ethical Guidelines
- All target data processed within Sarvakshan must remain strictly local/isolated.
- Generated intelligence dossiers must include proper classification headers and privacy safeguards.
