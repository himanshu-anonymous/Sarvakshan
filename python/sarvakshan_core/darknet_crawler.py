"""
Darknet & .Onion Hidden Service Crawler Engine
Crawls .onion hidden services, extracts PGP keys, crypto addresses, and geographic mentions.
"""

import re
from typing import List, Dict, Any
from .types import DarknetOnionHit

class DarknetCrawler:
    def __init__(self, socks5_proxy: str = "socks5h://127.0.0.1:9050"):
        self.proxy = socks5_proxy
        self.email_regex = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
        self.btc_regex = re.compile(r'\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b')
        self.xmr_regex = re.compile(r'\b4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}\b')
        self.pgp_regex = re.compile(r'-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]+?-----END PGP PUBLIC KEY BLOCK-----')

    def extract_artifacts(self, raw_html: str, onion_url: str) -> DarknetOnionHit:
        """
        Parses darknet HTML body to extract PGP keys, BTC/XMR addresses, emails, and geo mentions.
        """
        emails = self.email_regex.findall(raw_html)
        btc_addrs = self.btc_regex.findall(raw_html)
        xmr_addrs = self.xmr_regex.findall(raw_html)
        pgp_keys = self.pgp_regex.findall(raw_html)

        # Basic Geo-Mention keyword extractor
        geo_keywords = ["London", "New York", "Berlin", "Tokyo", "Delhi", "Dubai", "Singapore", "Zurich"]
        geo_mentions = []
        for city in geo_keywords:
            if re.search(r'\b' + re.escape(city) + r'\b', raw_html, re.IGNORECASE):
                geo_mentions.append({"location_name": city, "source": "DARKNET_FORUM_MENTION"})

        return DarknetOnionHit(
            onion_url=onion_url,
            page_title=self._extract_title(raw_html),
            extracted_text=raw_html[:500],
            pgp_keys=list(set(pgp_keys)),
            crypto_addresses=list(set(btc_addrs + xmr_addrs)),
            geotag_mentions=geo_mentions
        )

    def _extract_title(self, html: str) -> str:
        match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        return match.group(1).strip() if match else "Darknet Service"
