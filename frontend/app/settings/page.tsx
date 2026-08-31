"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Database, Server, Bell, Shield, Save, CheckCircle2, Sliders, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "Elena Rostova");
  const [role, setRole] = useState(user?.role || "Lead Architect");
  const [organization, setOrganization] = useState(user?.organization || "StreamPulse Media");

  const [realtimeAlerts, setRealtimeAlerts] = useState(true);
  const [kaggleSync, setKaggleSync] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [autoIntervention, setAutoIntervention] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("User Profile and Workspace settings successfully updated.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAlerts = () => {
    setToastMessage("Notification alert preferences and telemetry thresholds saved.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 relative">
      <TopHeader
        title="STREAM PULSE — Workspace Configuration & Settings"
        subtitle="Manage database connection strings, Kaggle credentials, telemetry triggers, and alert preferences."
        searchPlaceholder="Search settings, keys, webhooks..."
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0f1524] border border-cyan-500/80 shadow-2xl shadow-cyan-500/20 text-xs text-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-relaxed">{toastMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Authenticated Profile &amp; Role</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0c1220] border border-[#1a253c] rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/80 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Role / Job Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0c1220] border border-[#1a253c] rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/80 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#0c1220] border border-[#1a253c] rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/80 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                value={user?.email || "demo@streampulse.io"}
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3.5 py-2 text-slate-400 font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white text-xs font-semibold hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Real-Time Notification & Webhook Triggers */}
        <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Alerts &amp; Real-Time Triggers</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c1220] border border-[#1a253c]">
              <div>
                <h4 className="font-semibold text-white">Real-Time Churn Anomaly Alerts</h4>
                <p className="text-[11px] text-slate-400">Trigger bell notification when cohort churn spikes &gt; 70%.</p>
              </div>
              <button
                type="button"
                onClick={() => setRealtimeAlerts(!realtimeAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  realtimeAlerts ? "bg-cyan-500" : "bg-[#182238]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    realtimeAlerts ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c1220] border border-[#1a253c]">
              <div>
                <h4 className="font-semibold text-white">Kaggle Telemetry Auto-Sync</h4>
                <p className="text-[11px] text-slate-400">Sync 9,515 titles and 50,000 sessions with ML pipeline.</p>
              </div>
              <button
                type="button"
                onClick={() => setKaggleSync(!kaggleSync)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  kaggleSync ? "bg-cyan-500" : "bg-[#182238]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    kaggleSync ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c1220] border border-[#1a253c]">
              <div>
                <h4 className="font-semibold text-white">Automated Win-Back Webhooks</h4>
                <p className="text-[11px] text-slate-400">Dispatch carousel promotional payloads to OTT client apps.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoIntervention(!autoIntervention)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  autoIntervention ? "bg-cyan-500" : "bg-[#182238]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    autoIntervention ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleSaveAlerts}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#101626] border border-[#1a253c] text-white text-xs font-semibold hover:border-cyan-500/60 transition-all"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Alert Rules</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Database Connection</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">PostgreSQL URI / Fallback SQLite</label>
              <input
                type="text"
                readOnly
                value="postgresql://streampulse:***@localhost:5432/streampulse_db"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">FastAPI Service URL</label>
              <input
                type="text"
                readOnly
                value="http://localhost:8000"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Machine Learning Pipeline Status</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Trained Classifier Artifact</label>
              <input
                type="text"
                readOnly
                value="models/retention_model.pkl (RandomForestClassifier)"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Kaggle Telemetry Records</label>
              <input
                type="text"
                readOnly
                value="9,515 Titles · 50,000 Viewer Sessions · 5,000 Subscribers"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
