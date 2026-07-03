/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "healthy" }, { status: 200 });
}
