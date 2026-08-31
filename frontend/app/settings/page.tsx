"use client";

import React from "react";
import { TopHeader } from "@/components/TopHeader";
import { Database, Server } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <TopHeader
        title="Workspace Configuration & Settings"
        subtitle="Manage database connection strings, Kaggle credentials, and ML inference parameters."
        searchPlaceholder="Search settings..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Database Connection</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">PostgreSQL URI</label>
              <input
                type="text"
                readOnly
                value="postgresql://streampulse:***@localhost:5432/streampulse_db"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3 py-2 text-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">FastAPI Service URL</label>
              <input
                type="text"
                readOnly
                value="http://localhost:8000"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3 py-2 text-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Server className="w-4 h-4 text-purple-400" />
            <span>Machine Learning Artifacts</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Model Path</label>
              <input
                type="text"
                readOnly
                value="models/retention_model.pkl"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3 py-2 text-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Engineered Features Shape</label>
              <input
                type="text"
                readOnly
                value="5,000 Subscribers x 8 Features"
                className="w-full bg-[#080c14] border border-[#162035] rounded-xl px-3 py-2 text-slate-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
