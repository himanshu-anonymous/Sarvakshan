import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync("tmp/embassies_broad.json", "utf-8"));

// Deduplicate by OSM ID (some elements may match both tags)
const seen = new Set();
const features = raw.elements
  .map((el) => {
    if (seen.has(el.id)) return null;
    seen.add(el.id);

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) return null;

    const tags = el.tags || {};
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {
        name: tags.name || tags["name:en"] || "Unknown",
        country: tags.country || tags["addr:country"] || null,
        target: tags.target || null,
        type: tags.diplomatic || tags.office || tags.amenity || null,
        osm_id: el.id,
      },
    };
  })
  .filter(Boolean);

const geojson = { type: "FeatureCollection", features };
writeFileSync("public/data/embassies.geojson", JSON.stringify(geojson));
console.log(`Wrote ${features.length} diplomatic missions`);
