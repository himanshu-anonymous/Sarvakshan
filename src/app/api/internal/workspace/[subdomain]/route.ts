/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCloud } from "@/core/edition";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    if (!isCloud) {
        return NextResponse.json({ status: "active", plan: "basic" });
    }

    // Await params as required in Next.js 15+
    const resolvedParams = await params;
    const subdomain = resolvedParams.subdomain;

    try {
        const workspace = await prisma.workspace.findUnique({
            where: { subdomain },
            select: { status: true, plan: true }
        });

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }

        return NextResponse.json(workspace);
    } catch (e) {
        console.error("Failed to lookup workspace", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
