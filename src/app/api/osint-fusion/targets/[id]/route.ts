import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runPythonCoreAction } from "@/lib/osint-fusion/pythonBridge";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const target = await db.osintTarget.findUnique({
      where: { id },
      include: {
        records: true,
        socialRecords: true,
        darknetRecords: true,
        tracks: true,
        dossiers: true
      }
    });

    if (!target) {
      return NextResponse.json({ success: false, error: "Target not found" }, { status: 404 });
    }

    // Generate link graph from Python engine
    const graphData = await runPythonCoreAction("build_graph", {
      target_id: target.id,
      name: target.name,
      primary_email: target.primaryEmail
    });

    return NextResponse.json({ success: true, target, graph: graphData });
  } catch (error: any) {
    console.error("GET /api/osint-fusion/targets/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
