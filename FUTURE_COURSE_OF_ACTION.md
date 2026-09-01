# 🛡️ SARVAKSHAN — Future Course of Action & Engineering Roadmap
> **Classification**: Internal / Contributors Only  
> **Note**: For Aditya to read  
> **Project Scope**: All-Inclusive OSINT, GeoINT, & Darknet Multi-INT Fusion Platform

---

## 🎯 Executive Vision

Sarvakshan is an **All-Inclusive OSINT, GeoINT, & Darknet Intelligence Fusion Platform**.

By unifying native intelligence engines—**Visual Entity Link Graph Analysis**, **Automated Web & EXIF Reconnaissance**, **Darknet & .Onion Hidden Service Crawling**, **Social Media & Geotagged Media Mining**, **Asset & Infrastructure Geolocation**, **Public Records & Identifier Harvester** (960+ sources), and **Modular Transform Taxonomy**—with **Geospatial & Temporal Parameters**, Sarvakshan maps every digital trace directly onto a 4D Spatial-Temporal Canvas (X, Y, Z + Time) to synthesize automated **Confidential Intelligence Analysis Dossiers**.

---

## 🏗️ Native Platform Architecture & Engine Suite

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    SARVAKSHAN ALL-INCLUSIVE FUSION ENGINE ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
   │
   ├─► 1. VISUAL ENTITY LINK ANALYSIS ENGINE
   │   └─► Interactive Node Graph ──► Geospatial Node Coordinates & Co-location Edges
   │
   ├─► 2. SOCIAL MEDIA & GEOTAGGED MEDIA ENGINE
   │   └─► Profile & Post Miner ──► Photo EXIF, Story Check-ins, Geotagged Media & Graph
   │
   ├─► 3. DARKNET & .ONION HIDDEN SERVICE CRAWLER
   │   └─► Isolated SOCKS5 Crawler ──► Scraped .Onion Links, Emails, Crypto, & Geo-Mentions
   │
   ├─► 4. AUTOMATED WEB & EXIF RECONNAISSANCE ENGINE
   │   └─► Modular Scrapers ──► Scraped EXIF Media, Registrant Addr & Regional Leaks
   │
   ├─► 5. ASSET & INFRASTRUCTURE GEOLOCATION ENGINE
   │   └─► IoT / IP / Server Banners ──► Physical Datacenter Points & ISP Infrastructure
   │
   ├─► 6. PUBLIC RECORDS & IDENTIFIER HARVESTER ENGINE
   │   └─► 960+ Source Deep Search ──► Geocoded Public Records & Social Location Tags
   │
   └─► 7. MODULAR OSINT TAXONOMY & TRANSFORM ENGINE
       └─► Transform Pipeline Tree ──► Spatial Transform Taxonomy & 4D Geo Projection
```

---

## 🔬 Detailed Native Engine Capabilities & Geospatial Alignment

### 1. Visual Entity Link Analysis Engine
* **Core Function**: Native interactive entity and connection graph mapping (Person, Email, Phone, IP, Domain, Alias, Location, Social Handle).
* **Geospatial Parameter Alignment**:
  - **Geo-Node Coordinate Mapping**: Convert location and asset nodes directly into interactive Mapbox/Leaflet geographic layers (Lat/Long, GeoJSON Polygons).
  - **Spatial Proximity & Co-Location Edges**: Calculate edge weights based on physical distance between entities and simultaneous spatial-temporal presence.
  - **Graph-to-Map Sync**: Selecting an entity cluster in the link graph automatically filters and highlights its physical spatial footprint on the 4D map canvas.

### 2. Social Media & Geotagged Media Engine
* **Core Function**: Scraping target social profiles, photos, geotagged posts, story locations, comments, follower/following networks, tagged photos, photo EXIF metadata, hashtags, and geographic coordinates from geotagged media.
* **Geospatial Parameter Alignment**:
  - **Geotagged Photo & Story Mapping**: Extract exact Latitude/Longitude and timestamps from target social media posts, stories, and tagged photos to plot physical movement trajectories.
  - **Location-Based Comment & Tag Analysis**: Identify co-located entities based on mutual tagged media and comments on location-specific posts.
  - **Frequent Check-in Heatmap**: Synthesize check-in frequency across social platforms to refine target's Pattern-of-Life anchors.

### 3. Darknet & .Onion Hidden Service Crawler Engine
* **Core Function**: Isolated SOCKS5 proxy-based recursive crawling of .onion hidden services, extracting page titles, emails, PGP keys, BTC/XMR crypto addresses, and web links.
* **Geospatial Parameter Alignment**:
  - **Clearnet-to-Darknet Bridge Mapping**: Correlate .onion services with clearnet mirror IPs, domain records, and target server locations.
  - **Geocoding Scraped Darknet Mentions**: Extract geographic references, city names, and coordinate tags from .onion forum posts and marketplaces.
  - **Tor Exit Node & Infrastructure Correlation**: Map Tor relay/exit node geographic distributions associated with target darknet traffic.

### 4. Automated Web & EXIF Reconnaissance Engine
* **Core Function**: Modular automated data collection, passive/active web reconnaissance, and leak monitoring.
* **Geospatial Parameter Alignment**:
  - **Scraped EXIF & Geotag Harvester**: Automatically extract GPS coordinates, timestamps, and altitude from scraped web images/media.
  - **Registrant & WHOIS Spatial Geocoding**: Geocode physical addresses from WHOIS records, domain filings, and corporate registries.
  - **Regional Sentiment & Exposure Mapping**: Map physical locations mentioned in scraped pastes, forums, and web leaks.

### 5. Asset & Infrastructure Geolocation Engine
* **Core Function**: Scanning internet-connected devices, open ports, IoT assets, server banners, and SSL certificates.
* **Geospatial Parameter Alignment**:
  - **Physical Device & Datacenter Pinpointing**: Map IP subnets, BGP Autonomous System Numbers (ASNs), and exposed IoT devices to exact physical GPS coordinates and datacenter facilities.
  - **Infrastructure Heatmap Overlay**: Render density maps of target-controlled servers, routers, cameras, and industrial control systems across global regions.
  - **ISP & Cell Tower Triangulation**: Correlate server/device connections with regional internet service provider infrastructure and ground stations.

### 6. Public Records & Identifier Harvester Engine
* **Core Function**: Comprehensive lookup across 960+ public sources (emails, usernames, public records, court filings, gravatars, social profiles).
* **Geospatial Parameter Alignment**:
  - **Public Record Address Parser**: Extract and geocode physical residential/commercial addresses from public records, voter registries, and court filings.
  - **Social Profile Geo-Normalization**: Normalize unstructured location strings (e.g., *"San Francisco, CA"* -> `[37.7749, -122.4194]`) across 960+ profile sources.
  - **Cross-Source Co-Location Indexing**: Flag target appearance across multiple geographic regions based on email/username hits in regional databases.

### 7. Modular OSINT Taxonomy & Transform Engine
* **Core Function**: Structured taxonomy of OSINT input types (Domain, IP, Email, Person, Phone, Image, Network, Darknet, Social Profile) and transform pipelines.
* **Geospatial Parameter Alignment**:
  - **Spatial Transform Taxonomy**: Ensure every branch in the taxonomy terminates in a **Geospatial Projection Output** (e.g., `Person` -> `Social Profile` -> `Geotagged Photo` -> `Pattern-of-Life Cluster`).
  - **Modular Geo-Pipeline Orchestrator**: Enable analysts to chain transforms (e.g., `Email` -> `Social Profile` -> `Geotagged Post` -> `Darknet Mention` -> `Physical Coordinates`) with real-time spatial projection.

---

## 🚀 Module Breakdown & Contributor Tasks

### Pillar 1: Person OSINT & Social Media Engine
* [ ] **Public Records & 960+ Source Harvester**: Cross-platform handle/email lookup modules integrating open public record lookup logic.
* [ ] **Social Media & Geotagged Media Miner**: Native parser for social profile scraping, photo EXIF geotag extraction, story check-in mapping, and tagged photo network analysis.
* [ ] **Public Record Address Parser**: Automated NLP address extraction and geocoding pipeline.

### Pillar 2: Darknet & Infrastructure Recon Engine
* [ ] **Darknet .Onion Crawler**: Isolated SOCKS5 proxy crawler module extracting page titles, emails, PGP keys, BTC addresses, and .onion links.
* [ ] **Asset Infrastructure Geolocator**: IP/IoT physical infrastructure pinpointing and BGP ASN mapping.
* [ ] **Automated Web Recon Engine**: Modular web scraper with automated EXIF media geotag extraction.

### Pillar 3: Visual Link Analysis & Geospatial Workspace
* [ ] **Interactive Link Graph Canvas**: Native node-edge visualizer bi-directionally synced with 4D Mapbox map.
* [ ] **Pattern of Life (PoL) Analytics**: **DBSCAN spatial clustering** for Primary Residence Anchor, Workplace HQ, and Transit Hubs.
* [ ] **Velocity & Transit Vector Verification**: Calculate velocity vectors between consecutive spatial points to detect travel modes and filter invalid data jumps.

### Pillar 4: Confidential Analysis & Intelligence Dossier Builder
* [ ] **OPSEC & Threat Scorer**: Rate operational security awareness based on public metadata leakage, social exposure, darknet presence, and infrastructure visibility.
* [ ] **Automated Dossier Generator**: One-click generation of executive intelligence dossiers (`CONFIDENTIAL // RESTRICTED RESEARCH`) downloadable as Markdown/PDF.

---

## 📋 Contributor Task Allocation Matrix

| Component | Responsibility | Primary Lead | Priority | Status |
|---|---|---|---|---|
| **Social Media & Public Harvester** | Handle/email lookups, 960+ public sources, social geotagged media parser, & address geocoder | Aditya / Contributor | P0 | Planned |
| **Darknet & Infrastructure Recon** | Native .onion darknet crawler, IP/IoT physical geolocator, & EXIF media harvester | Aditya / Contributor | P0 | Planned |
| **Visual Link Graph & 4D Map** | Synced link graph canvas + Mapbox time-slider trajectory workspace | Core Team | P1 | Planned |
| **Intel Synthesis & Dossiers** | OPSEC scoring, exposure indexing, anomaly alerts, & PDF dossier engine | Core Team | P1 | Planned |

---

## 🛡️ Security & Ethical Guidelines
- All target data processed within Sarvakshan must remain strictly local/isolated.
- Darknet crawling must run over isolated SOCKS5 proxies with proper anonymity controls.
- Generated intelligence dossiers must include proper classification headers and privacy safeguards.
