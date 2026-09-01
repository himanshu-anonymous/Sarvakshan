import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runPythonCoreAction } from "@/lib/osint-fusion/pythonBridge";
import { runApiAndFunctionPreflightCheck } from "@/lib/osint-fusion/preflightCheck";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preflight = await runApiAndFunctionPreflightCheck(`POST /api/osint-fusion/dossier/${id}`);

  try {
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
      return NextResponse.json({ success: false, preflight, error: "Target not found" }, { status: 404 });
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

    return NextResponse.json({ success: true, preflight, dossier });
  } catch (error: any) {
    console.error("POST /api/osint-fusion/dossier/[id] error:", error);
    return NextResponse.json({ success: false, preflight, error: error.message }, { status: 500 });
  }
}
