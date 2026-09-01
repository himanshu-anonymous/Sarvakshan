"""
Social Media & Geotagged Media Mining Engine
Mines social profiles, posts, EXIF geotags, check-ins, and follower networks.
"""

import json
import re
from typing import List, Dict, Any
from .types import SocialMediaPost, GeoTrackPoint

class SocialMediaHarvester:
    def __init__(self):
        pass

    def parse_exif_metadata(self, raw_meta: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts GPS coordinates (lat, long, alt) and camera specs from EXIF metadata dictionary.
        """
        result = {
            "latitude": None,
            "longitude": None,
            "altitude": None,
            "camera_model": raw_meta.get("Model"),
            "timestamp": raw_meta.get("DateTimeOriginal")
        }
        
        if "GPSLatitude" in raw_meta and "GPSLongitude" in raw_meta:
            result["latitude"] = float(raw_meta["GPSLatitude"])
            result["longitude"] = float(raw_meta["GPSLongitude"])
        if "GPSAltitude" in raw_meta:
            result["altitude"] = float(raw_meta["GPSAltitude"])

        return result

    def process_social_posts(self, username: str, posts_data: List[Dict[str, Any]]) -> List[SocialMediaPost]:
        """
        Parses raw scraped social media posts into structured SocialMediaPost items.
        """
        parsed_posts = []
        for p in posts_data:
            lat = p.get("location", {}).get("lat") if isinstance(p.get("location"), dict) else None
            lng = p.get("location", {}).get("lng") if isinstance(p.get("location"), dict) else None
            exif = self.parse_exif_metadata(p.get("exif", {}))

            post_obj = SocialMediaPost(
                platform=p.get("platform", "Instagram"),
                username=username,
                post_text=p.get("text"),
                media_url=p.get("media_url"),
                latitude=lat or exif.get("latitude"),
                longitude=lng or exif.get("longitude"),
                exif_data=exif,
                timestamp=p.get("timestamp")
            )
            parsed_posts.append(post_obj)

        return parsed_posts

    def extract_geo_tracks(self, posts: List[SocialMediaPost]) -> List[GeoTrackPoint]:
        """
        Converts geotagged social posts into spatial trajectory points.
        """
        tracks = []
        for post in posts:
            if post.latitude is not None and post.longitude is not None:
                tracks.append(GeoTrackPoint(
                    latitude=post.latitude,
                    longitude=post.longitude,
                    timestamp=post.timestamp or "2026-09-01T00:00:00Z",
                    location_type="SOCIAL_CHECKIN",
                    source=f"SOCIAL_MEDIA_{post.platform.upper()}",
                    confidence=0.9
                ))
        return tracks
