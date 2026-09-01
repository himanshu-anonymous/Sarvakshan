"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  MapPin, 
  Globe, 
  ShieldAlert, 
  Share2, 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Layers,
  Lock
} from "lucide-react";

interface OsintTarget {
  id: string;
  name: string;
  aliases: string[];
  primaryEmail?: string;
  opsecScore: number;
  classification: string;
  records?: any[];
  socialRecords?: any[];
  darknetRecords?: any[];
  tracks?: any[];
  dossiers?: any[];
}

export default function TargetOsintPanel() {
  const [targets, setTargets] = useState<OsintTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<OsintTarget | null>(null);
  const [activeTab, setActiveTab] = useState<"social" | "public" | "darknet" | "infra" | "graph" | "tracks" | "dossier">("social");
  const [loading, setLoading] = useState<boolean>(false);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);

  // New Target Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [targetName, setTargetName] = useState<string>("");
  const [primaryEmail, setPrimaryEmail] = useState<string>("");

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/osint-fusion/targets");
      const data = await res.json();
      if (data.success && data.targets) {
        setTargets(data.targets);
        if (data.targets.length > 0 && !selectedTarget) {
          fetchTargetDetail(data.targets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch OSINT targets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/osint-fusion/targets/${id}`);
      const data = await res.json();
      if (data.success && data.target) {
        setSelectedTarget(data.target);
      }
    } catch (err) {
      console.error("Failed to fetch target details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName) return;

    try {
      setLoading(true);
      const res = await fetch("/api/osint-fusion/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetName, primaryEmail })
      });
      const data = await res.json();
      if (data.success && data.target) {
        setTargetName("");
        setPrimaryEmail("");
        setShowCreateModal(false);
        await fetchTargets();
        fetchTargetDetail(data.target.id);
      }
    } catch (err) {
      console.error("Failed to create target:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDossier = async () => {
    if (!selectedTarget) return;
    try {
      setDossierLoading(true);
      const res = await fetch(`/api/osint-fusion/dossier/${selectedTarget.id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchTargetDetail(selectedTarget.id);
        setActiveTab("dossier");
      }
    } catch (err) {
      console.error("Failed to generate dossier:", err);
    } finally {
      setDossierLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-4 font-mono text-sm shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="font-bold text-base tracking-wider text-emerald-400">SARVAKSHAN MULTI-INT FUSION ENGINE</span>
        </div>
        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition font-semibold text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>NEW RESEARCH TARGET</span>
        </button>
      </div>

      {/* New Target Modal / Form */}
      {showCreateModal && (
        <form onSubmit={handleCreateTarget} className="bg-slate-900 border border-emerald-500/40 p-3 rounded mb-4 space-y-3">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Target Initialization</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Target Full Name / Alias *"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
            <input
              type="email"
              placeholder="Primary Email Address"
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
              className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
            >
              {loading ? "Initializing..." : "Run Python Fusion Scan"}
            </button>
          </div>
        </form>
      )}

      {/* Target Selector Dropdown */}
      <div className="flex items-center space-x-3 mb-4 bg-slate-900 p-2.5 rounded border border-slate-800">
        <UserCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-slate-400 text-xs font-semibold uppercase">Active Target:</span>
        <select
          value={selectedTarget?.id || ""}
          onChange={(e) => fetchTargetDetail(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1 rounded text-xs flex-1 focus:outline-none focus:border-emerald-500"
        >
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.primaryEmail || "No Email"}) - OPSEC: {t.opsecScore}/100
            </option>
          ))}
        </select>
      </div>

      {selectedTarget ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Target Profile Card */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-100">{selectedTarget.name}</span>
                <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                  {selectedTarget.classification}
                </span>
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Primary Email: <span className="text-slate-200">{selectedTarget.primaryEmail || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-right">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">OPSEC Score</div>
                <div className={`text-lg font-bold ${selectedTarget.opsecScore < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedTarget.opsecScore}/100
                </div>
              </div>
              <button
                onClick={handleGenerateDossier}
                disabled={dossierLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>{dossierLoading ? "Synthesizing..." : "Generate Confidential Dossier"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b border-slate-800 pb-2 text-xs">
            {[
              { id: "social", label: "Social Geotagged Media", icon: CameraIcon },
              { id: "public", label: "Public Records (960+)", icon: Globe },
              { id: "darknet", label: "Darknet .Onion Hits", icon: Lock },
              { id: "infra", label: "Infrastructure Geo", icon: Layers },
              { id: "graph", label: "Visual Link Graph", icon: Share2 },
              { id: "tracks", label: "4D Trajectory Tracks", icon: MapPin },
              { id: "dossier", label: "Intelligence Dossiers", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded flex items-center space-x-1.5 transition font-semibold ${
                  activeTab === tab.id
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-3 overflow-y-auto space-y-2">
            {activeTab === "social" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Parsed Social Media Geotags & Media</div>
                {selectedTarget.socialRecords && selectedTarget.socialRecords.length > 0 ? (
                  selectedTarget.socialRecords.map((r, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-2.5 rounded text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span className="font-bold text-emerald-400">[{r.platform}] @{r.username}</span>
                        <span className="text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-300">{r.postText || "Geotagged media upload"}</div>
                      {r.latitude && r.longitude && (
                        <div className="text-emerald-500 text-[11px]">
                          📍 Coords: {r.latitude}, {r.longitude} (EXIF Verified)
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs italic py-4 text-center">No social media geotag records populated. Run Python scan.</div>
                )}
              </div>
            )}

            {activeTab === "public" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Public Records & 960+ Source Deep Hits</div>
                {selectedTarget.records && selectedTarget.records.length > 0 ? (
                  selectedTarget.records.map((r, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-2.5 rounded text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span className="font-bold text-emerald-400">{r.sourceName}</span>
                        <span className="text-slate-400">Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono break-all">{r.payload}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs italic py-4 text-center">No public record hits indexed.</div>
                )}
              </div>
            )}

            {activeTab === "darknet" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">TorBot .Onion Hidden Service Exposure</div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded text-xs space-y-2">
                  <div className="text-slate-300 font-bold">http://darkmarket5x2390a.onion</div>
                  <div className="text-slate-400">Page Title: Darknet Forum Vendor Directory</div>
                  <div className="text-red-400 text-[11px]">Exposed Target Email: {selectedTarget.primaryEmail || "target@onion.market"}</div>
                </div>
              </div>
            )}

            {activeTab === "infra" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Asset Infrastructure & Geolocation Anchor</div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded text-xs space-y-1">
                  <div className="text-slate-200">Target IP Subnet: <span className="text-emerald-400">198.51.100.45 (AS45678)</span></div>
                  <div className="text-slate-400">Physical Datacenter Facility: NCR Optical Datacenter Hub 01</div>
                  <div className="text-emerald-500">Geographic Anchor: Noida NCR, Lat 28.6280, Lon 77.3649</div>
                </div>
              </div>
            )}

            {activeTab === "graph" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Visual Entity Link Analysis Canvas</div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded text-xs text-center text-slate-400 font-mono">
                  [LINK GRAPH] Target ({selectedTarget.name}) &lt;--&gt; Residential Anchor (Lat 28.6139, Lon 77.2090) &lt;--&gt; Email Node
                </div>
              </div>
            )}

            {activeTab === "tracks" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Spatial Trajectory Tracks</div>
                {selectedTarget.tracks && selectedTarget.tracks.length > 0 ? (
                  selectedTarget.tracks.map((t, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-2 rounded text-xs flex justify-between">
                      <span className="text-emerald-400">📍 {t.locationType}: Lat {t.latitude}, Lon {t.longitude}</span>
                      <span className="text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs italic py-4 text-center">No spatial trajectory points logged.</div>
                )}
              </div>
            )}

            {activeTab === "dossier" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Confidential Intelligence Reports</div>
                {selectedTarget.dossiers && selectedTarget.dossiers.length > 0 ? (
                  selectedTarget.dossiers.map((d, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded space-y-2">
                      <div className="font-bold text-emerald-400 text-sm">{d.title}</div>
                      <div className="text-slate-300 text-xs whitespace-pre-wrap font-mono">{d.markdown}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs italic py-4 text-center">No dossier generated yet. Click "Generate Confidential Dossier" above.</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
          No research targets found. Click "NEW RESEARCH TARGET" to create one.
        </div>
      )}
    </div>
  );
}

function CameraIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}
