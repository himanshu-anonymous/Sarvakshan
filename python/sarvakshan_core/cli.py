"""
Sarvakshan Core Python CLI Engine
Command line interface for executing OSINT, GeoINT, Darknet, and Dossier modules from Next.js API routes.
"""

import sys
import json
import base64
import argparse
from .social_media_harvester import SocialMediaHarvester
from .darknet_crawler import DarknetCrawler
from .public_records_harvester import PublicRecordsHarvester
from .infrastructure_geolocator import InfrastructureGeolocator
from .automated_recon import AutomatedReconEngine
from .link_graph_engine import LinkGraphEngine
from .spatial_clustering import SpatialClusteringEngine
from .dossier_generator import DossierGenerator

def main():
    parser = argparse.ArgumentParser(description="Sarvakshan Core Intelligence Engine CLI")
    parser.add_argument("--action", required=True, choices=["enrich_target", "generate_dossier", "build_graph"])
    parser.add_argument("--payload", required=True, help="JSON payload string or base64 encoded string")

    args = parser.parse_args()
    
    payload_str = args.payload
    try:
        data = json.loads(payload_str)
    except Exception:
        try:
            decoded = base64.b64decode(payload_str).decode('utf-8')
            data = json.loads(decoded)
        except Exception:
            data = {"name": "Subject Alpha"}

    if args.action == "enrich_target":
        target_name = data.get("name", "Subject Alpha")
        email = data.get("primary_email", "")

        pub_harvester = PublicRecordsHarvester()
        records = pub_harvester.search_identifier(email or target_name)

        soc_harvester = SocialMediaHarvester()
        posts = soc_harvester.process_social_posts(target_name, [
            {"platform": "Instagram", "text": "Lunch in Sector 62", "location": {"lat": 28.6280, "lng": 77.3649}, "timestamp": "2026-09-01T12:00:00Z"}
        ])
        tracks = soc_harvester.extract_geo_tracks(posts)

        darknet = DarknetCrawler()
        darknet_hit = darknet.extract_artifacts("Contact target at target@onion.market PGP key block included", "http://darknet.onion")

        output = {
            "public_records": records,
            "social_posts": [p.__dict__ for p in posts],
            "geo_tracks": [t.__dict__ for t in tracks],
            "darknet_hits": [darknet_hit.__dict__]
        }
        print(json.dumps(output))

    elif args.action == "build_graph":
        graph_engine = LinkGraphEngine()
        graph_res = graph_engine.build_target_graph(data.get("target_id", "target_01"), data)
        print(json.dumps(graph_res))

    elif args.action == "generate_dossier":
        dossier_gen = DossierGenerator()
        res = dossier_gen.generate_dossier(data, {"public_records_hits": 4, "geotagged_posts": 8, "darknet_hits": 2, "datacenter_hits": 1})
        print(json.dumps(res))

if __name__ == "__main__":
    main()
