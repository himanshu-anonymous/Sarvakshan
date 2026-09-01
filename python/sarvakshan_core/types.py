"""
Core Type Definitions for Sarvakshan OSINT & GeoINT Processing Engine
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class GeoTrackPoint:
    latitude: float
    longitude: float
    timestamp: str
    location_type: str = "POINT"
    altitude: Optional[float] = None
    speed: Optional[float] = None
    source: str = "OSINT_HARVESTER"
    confidence: float = 1.0

@dataclass
class GraphNode:
    id: str
    label: str
    node_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    properties: Dict[str, Any] = field(default_factory=dict)

@dataclass
class GraphEdge:
    source_id: str
    target_id: str
    relationship: str
    weight: float = 1.0

@dataclass
class SocialMediaPost:
    platform: str
    username: str
    post_text: Optional[str] = None
    media_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    exif_data: Dict[str, Any] = field(default_factory=dict)
    timestamp: Optional[str] = None

@dataclass
class DarknetOnionHit:
    onion_url: str
    page_title: Optional[str] = None
    extracted_text: Optional[str] = None
    pgp_keys: List[str] = field(default_factory=list)
    crypto_addresses: List[str] = field(default_factory=list)
    geotag_mentions: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class TargetProfile:
    target_id: str
    name: str
    aliases: List[str] = field(default_factory=list)
    primary_email: Optional[str] = None
    primary_phone: Optional[str] = None
    opsec_score: int = 100
    classification: str = "CONFIDENTIAL"
