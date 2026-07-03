/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { AppShell } from "@/components/layout/AppShell";
import { DemoAdStrip } from "@/components/ads/DemoAdStrip";

export default function Home() {
  return (
    <div className="page-root">
      <AppShell />
      <DemoAdStrip />
    </div>
  );
}
