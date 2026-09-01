# 🛡️ SARVAKSHAN — Future Course of Action & Engineering Roadmap
> **Classification**: Internal / Contributors Only  
> **Note**: For Aditya to read  
> **Project Scope**: All-Inclusive OSINT, GeoINT, & Darknet Multi-INT Fusion Platform  
> **Primary Backend Core**: Python (OSINT, GeoINT & Darknet Processing Engine)

---

## 🎯 Executive Vision

Sarvakshan is an **All-Inclusive OSINT, GeoINT, & Darknet Intelligence Fusion Platform**.

The core intelligence processing logic is built natively in **Python** (`python/sarvakshan_core/`), driving seven primary engines: **Visual Entity Link Graph Analysis**, **Automated Web & EXIF Reconnaissance**, **Darknet & .Onion Hidden Service Crawling**, **Social Media & Geotagged Media Mining**, **Asset & Infrastructure Geolocation**, **Public Records & Identifier Harvester** (960+ sources), and **Modular Transform Taxonomy**.

These Python engines integrate directly with **Geospatial & Temporal Parameters**, mapping every digital trace onto a 4D Spatial-Temporal Canvas (X, Y, Z + Time) to synthesize automated **Confidential Intelligence Analysis Dossiers**.

---

## 🏗️ Native Platform Architecture (Python Core)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│              SARVAKSHAN ALL-INCLUSIVE FUSION ENGINE (PYTHON CORE ENGINE)                │
└─────────────────────────────────────────────────────────────────────────────────────────┘
   │
   ├─► 1. VISUAL ENTITY LINK ANALYSIS ENGINE (python/sarvakshan_core/link_graph_engine.py)
   │   └─► Interactive Node Graph ──► Geospatial Node Coordinates & Co-location Edges
   │
   ├─► 2. SOCIAL MEDIA & GEOTAGGED MEDIA ENGINE (python/sarvakshan_core/social_media_harvester.py)
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

## 🔬 Detailed Python Engine Capabilities & Geospatial Alignment

### 1. Visual Entity Link Analysis Engine (`python/sarvakshan_core/link_graph_engine.py`)
* **Language & Stack**: Python (`networkx`, `scipy`)
* **Capabilities**: Interactive entity and connection graph mapping (Person, Email, Phone, IP, Domain, Alias, Location, Social Handle).
* **Geospatial Parameter Alignment**:
  - **Geo-Node Coordinate Mapping**: Convert location and asset nodes directly into interactive Mapbox/Leaflet geographic layers (Lat/Long, GeoJSON Polygons).
  - **Spatial Proximity & Co-Location Edges**: Calculate edge weights based on physical distance between entities and simultaneous spatial-temporal presence.
  - **Graph-to-Map Sync**: Selecting an entity cluster in the link graph automatically filters and highlights its physical spatial footprint on the 4D map canvas.

### 2. Social Media & Geotagged Media Engine (`python/sarvakshan_core/social_media_harvester.py`)
* **Language & Stack**: Python (`requests`, `beautifulsoup4`, `Pillow`, `exifread`)
* **Capabilities**: Scraping target social profiles, photos, geotagged posts, story locations, comments, follower/following networks, tagged photos, photo EXIF metadata, hashtags, and geographic coordinates from geotagged media.
* **Geospatial Parameter Alignment**:
  - **Geotagged Photo & Story Mapping**: Extract exact Latitude/Longitude and timestamps from target social media posts, stories, and tagged photos to plot physical movement trajectories.
  - **Location-Based Comment & Tag Analysis**: Identify co-located entities based on mutual tagged media and comments on location-specific posts.
  - **Frequent Check-in Heatmap**: Synthesize check-in frequency across social platforms to refine target's Pattern-of-Life anchors.

### 3. Darknet & .Onion Hidden Service Crawler Engine (`python/sarvakshan_core/darknet_crawler.py`)
* **Language & Stack**: Python (`PySocks`, `stem`, `requests[socks]`, `re`)
* **Capabilities**: Isolated SOCKS5 Tor proxy-based recursive crawling of .onion hidden services, extracting page titles, emails, PGP keys, BTC/XMR crypto addresses, and web links.
* **Geospatial Parameter Alignment**:
  - **Clearnet-to-Darknet Bridge Mapping**: Correlate .onion services with clearnet mirror IPs, domain records, and target server locations.
  - **Geocoding Scraped Darknet Mentions**: Extract geographic references, city names, and coordinate tags from .onion forum posts and marketplaces.
  - **Tor Exit Node & Infrastructure Correlation**: Map Tor relay/exit node geographic distributions associated with target darknet traffic.

### 4. Automated Web & EXIF Reconnaissance Engine (`python/sarvakshan_core/automated_recon.py`)
* **Language & Stack**: Python (`aiohttp`, `asyncio`, `exifread`)
* **Capabilities**: Modular automated data collection, passive/active web reconnaissance, and leak monitoring.
* **Geospatial Parameter Alignment**:
  - **Scraped EXIF & Geotag Harvester**: Automatically extract GPS coordinates, timestamps, and altitude from scraped web images/media.
  - **Registrant & WHOIS Spatial Geocoding**: Geocode physical addresses from WHOIS records, domain filings, and corporate registries.
  - **Regional Sentiment & Exposure Mapping**: Map physical locations mentioned in scraped pastes, forums, and web leaks.

### 5. Asset & Infrastructure Geolocation Engine (`python/sarvakshan_core/infrastructure_geolocator.py`)
* **Language & Stack**: Python (`geoip2`, `ipaddress`, `socket`)
* **Capabilities**: Scanning internet-connected devices, open ports, IoT assets, server banners, and SSL certificates.
* **Geospatial Parameter Alignment**:
  - **Physical Device & Datacenter Pinpointing**: Map IP subnets, BGP Autonomous System Numbers (ASNs), and exposed IoT devices to exact physical GPS coordinates and datacenter facilities.
  - **Infrastructure Heatmap Overlay**: Render density maps of target-controlled servers, routers, cameras, and industrial control systems across global regions.
  - **ISP & Cell Tower Triangulation**: Correlate server/device connections with regional internet service provider infrastructure and ground stations.

### 6. Public Records & Identifier Harvester Engine (`python/sarvakshan_core/public_records_harvester.py`)
* **Language & Stack**: Python (`aiohttp`, `spacy` / `nltk` for address parsing)
* **Capabilities**: Comprehensive lookup across 960+ public sources (emails, usernames, public records, court filings, gravatars, social profiles).
* **Geospatial Parameter Alignment**:
  - **Public Record Address Parser**: Extract and geocode physical residential/commercial addresses from public records, voter registries, and court filings.
  - **Social Profile Geo-Normalization**: Normalize unstructured location strings (e.g., *"San Francisco, CA"* -> `[37.7749, -122.4194]`) across 960+ profile sources.
  - **Cross-Source Co-Location Indexing**: Flag target appearance across multiple geographic regions based on email/username hits in regional databases.

### 7. Spatial Clustering & Pattern of Life Engine (`python/sarvakshan_core/spatial_clustering.py`)
* **Language & Stack**: Python (`scikit-learn` DBSCAN, `numpy`, `geopy`)
* **Capabilities**: Spatial-temporal clustering of target locations to extract Primary Residence Anchor, Workplace HQ, and Transit Hubs.
* **Geospatial Parameter Alignment**:
  - **Velocity Vector Calculation**: Compute transit speed between consecutive spatial points to determine travel mode (walking, driving, flying) and detect anomalous jumps.

---

## 🚀 Module Breakdown & Contributor Tasks (Python Core)

### Pillar 1: Python OSINT Harvesters & Social Media Engine
* [ ] **Public Records & 960+ Source Harvester** (`python/sarvakshan_core/public_records_harvester.py`): Cross-platform handle/email lookup modules with NLP address geocoding.
* [ ] **Social Media & Geotagged Media Miner** (`python/sarvakshan_core/social_media_harvester.py`): Python parser for social profile scraping, photo EXIF geotag extraction, story check-ins, and tagged photo network analysis.

### Pillar 2: Python Darknet & Infrastructure Recon Engine
* [ ] **Darknet .Onion Crawler** (`python/sarvakshan_core/darknet_crawler.py`): SOCKS5 PySocks crawler module extracting page titles, emails, PGP keys, BTC addresses, and .onion links.
* [ ] **Asset Infrastructure Geolocator** (`python/sarvakshan_core/infrastructure_geolocator.py`): IP/IoT physical infrastructure pinpointing and BGP ASN mapping in Python.
* [ ] **Automated Web Recon Engine** (`python/sarvakshan_core/automated_recon.py`): Async Python web scraper with automated EXIF media geotag extraction.

### Pillar 3: Visual Link Analysis & Geospatial Workspace
* [ ] **Python Link Graph & Spatial Engine** (`python/sarvakshan_core/link_graph_engine.py` & `spatial_clustering.py`): NetworkX link analysis + Scikit-Learn DBSCAN clustering bi-directionally synced with 4D Mapbox map UI.
* [ ] **Velocity & Transit Vector Verification**: Velocity vector calculation between spatial coordinates in Python.

### Pillar 4: Confidential Analysis & Intelligence Dossier Builder
* [ ] **Python Dossier Generator** (`python/sarvakshan_core/dossier_generator.py`): Rate OPSEC awareness and generate executive intelligence dossiers (`CONFIDENTIAL // RESTRICTED RESEARCH`) in Markdown/PDF.

---

## 📋 Contributor Task Allocation Matrix

| Component | Responsibility | Primary Lead | Language / Priority | Status |
|---|---|---|---|---|
| **Social Media & Public Harvester** | Handle/email lookups, 960+ public sources, social geotagged media parser, & address geocoder | Aditya / Contributor | Python / P0 | Planned |
| **Darknet & Infrastructure Recon** | Native .onion darknet crawler, IP/IoT physical geolocator, & EXIF media harvester | Aditya / Contributor | Python / P0 | Planned |
| **Visual Link Graph & 4D Map** | NetworkX link graph + Scikit-Learn DBSCAN + Mapbox time-slider UI | Core Team | Python + TS / P1 | Planned |
| **Intel Synthesis & Dossiers** | OPSEC scoring, exposure indexing, anomaly alerts, & PDF dossier engine | Core Team | Python / P1 | Planned |

---

## 🛡️ Security & Ethical Guidelines
- All target data processed within Sarvakshan must remain strictly local/isolated.
- Darknet crawling must run over isolated SOCKS5 proxies with proper anonymity controls.
- Generated intelligence dossiers must include proper classification headers and privacy safeguards.
