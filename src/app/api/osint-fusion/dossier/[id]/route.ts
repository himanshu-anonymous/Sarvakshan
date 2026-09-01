import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runPythonCoreAction } from "@/lib/osint-fusion/pythonBridge";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const target = await db.osintTarget.findUnique({
      where: { id },
      include: {
        records: true,
        socialRecords: true,
        darknetRecords: true,
        tracks: true
      }
    });

    if (!target) {
      return NextResponse.json({ success: false, error: "Target not found" }, { status: 404 });
    }

    // Call Python core dossier synthesizer
    const dossierResult = await runPythonCoreAction("generate_dossier", {
      target_id: target.id,
      name: target.name,
      primary_email: target.primaryEmail,
      opsec_score: target.opsecScore
    });

    // Save dossier to DB
    const dossier = await db.confidentialDossier.create({
      data: {
        targetId: target.id,
        title: dossierResult.title,
        summary: dossierResult.summary,
        riskScore: dossierResult.risk_score,
        markdown: dossierResult.markdown
      }
    });

    return NextResponse.json({ success: true, dossier });
  } catch (error: any) {
    console.error("POST /api/osint-fusion/dossier/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
