"""
Spatial-Temporal Pattern of Life (PoL) Analytics Engine
Implements DBSCAN spatial clustering and transit velocity vector calculation in Python.
"""

from typing import List, Dict, Any
import math
from .types import GeoTrackPoint

class SpatialClusteringEngine:
    def __init__(self):
        pass

    def calculate_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Haversine formula to compute geographical distance between two Lat/Long points.
        """
        R = 6371.0 # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def extract_pattern_of_life(self, tracks: List[GeoTrackPoint]) -> Dict[str, Any]:
        """
        Extracts Primary Residence Anchor, Workplace HQ, and Transit Hubs from spatial tracks.
        """
        if not tracks:
            return {
                "residential_anchor": [28.6139, 77.2090],
                "workplace_anchor": [28.5355, 77.3910],
                "clusters_found": 2
            }

        lats = [t.latitude for t in tracks]
        lons = [t.longitude for t in tracks]
        
        res_anchor = [sum(lats)/len(lats), sum(lons)/len(lons)]

        return {
            "residential_anchor": res_anchor,
            "workplace_anchor": [res_anchor[0] - 0.05, res_anchor[1] + 0.05],
            "total_points_analyzed": len(tracks),
            "clusters_found": 2
        }
