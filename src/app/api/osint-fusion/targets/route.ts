import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runPythonCoreAction } from "@/lib/osint-fusion/pythonBridge";

export async function GET() {
  try {
    const targets = await db.osintTarget.findMany({
      include: {
        records: true,
        socialRecords: true,
        darknetRecords: true,
        tracks: true,
        dossiers: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, targets });
  } catch (error: any) {
    console.error("GET /api/osint-fusion/targets error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, aliases, primaryEmail, primaryPhone } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Target name is required" }, { status: 400 });
    }

    // 1. Create Target in DB
    const target = await db.osintTarget.create({
      data: {
        name,
        aliases: aliases || [],
        primaryEmail: primaryEmail || null,
        primaryPhone: primaryPhone || null,
        opsecScore: 75,
        classification: "CONFIDENTIAL"
      }
    });

    // 2. Trigger Python Core OSINT/GeoINT Enrichment Engine
    const enrichment = await runPythonCoreAction("enrich_target", {
      target_id: target.id,
      name: target.name,
      primary_email: target.primaryEmail
    });

    // 3. Save Geo Tracks
    if (enrichment.geo_tracks && Array.isArray(enrichment.geo_tracks)) {
      for (const track of enrichment.geo_tracks) {
        await db.geospatialTrack.create({
          data: {
            targetId: target.id,
            latitude: track.latitude,
            longitude: track.longitude,
            locationType: track.location_type || "POINT",
            source: track.source || "PYTHON_CORE",
            timestamp: new Date(track.timestamp || Date.now())
          }
        });
      }
    }

    // 4. Save Public Records
    if (enrichment.public_records && Array.isArray(enrichment.public_records)) {
      for (const rec of enrichment.public_records) {
        await db.osintRecord.create({
          data: {
            targetId: target.id,
            sourceType: rec.source_type,
            sourceName: rec.source_name,
            payload: JSON.stringify(rec),
            confidence: rec.confidence || 0.9
          }
        });
      }
    }

    return NextResponse.json({ success: true, target, enrichment });
  } catch (error: any) {
    console.error("POST /api/osint-fusion/targets error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
