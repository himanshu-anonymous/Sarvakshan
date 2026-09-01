"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TargetOsintPanel from "@/components/panels/TargetOsintPanel";
import { ShieldAlert, Globe, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

function OsintFusionContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get("target");
  const ipParam = searchParams.get("ip");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-emerald-500 selection:text-slate-950">
      {/* Web Workspace Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-slate-400 hover:text-emerald-400 transition flex items-center space-x-1 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>GLOBE MAIN</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider text-emerald-400 text-sm">
              SARVAKSHAN MULTI-INT FUSION WEB WORKSPACE
            </span>
          </div>
        </div>

        {ipParam && (
          <div className="bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded text-xs flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">REDIRECTED IP:</span>
            <span className="text-emerald-300 font-bold">{ipParam}</span>
          </div>
        )}

        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-red-950 text-red-400 border border-red-800 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest">
            CONFIDENTIAL // RESTRICTED
          </span>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 flex flex-col max-w-7xl w-full mx-auto space-y-4">
        {targetId && (
          <div className="bg-slate-900 border border-slate-800 p-3 rounded text-xs flex items-center justify-between text-slate-300">
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Redirected from TUI Session. Pre-loaded Target ID: <strong className="text-emerald-400">{targetId}</strong></span>
            </div>
            <span className="text-slate-500">Live Web Sync Active</span>
          </div>
        )}

        <div className="flex-1 min-h-[700px]">
          <TargetOsintPanel />
        </div>
      </main>
    </div>
  );
}

export default function OsintFusionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-emerald-400 font-mono">Loading Web Visual Workspace...</div>}>
      <OsintFusionContent />
    </Suspense>
  );
}
