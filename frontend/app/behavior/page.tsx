"use client";

import React, { useEffect, useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Sparkles, Download, CheckCircle2, Sliders } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ViewerBehaviorPage() {
  const [pipelineData, setPipelineData] = useState([
    { value: "100%", label: "Start Episode", ring: "border-[#8b5cf6] text-[#8b5cf6]" },
    { value: "34%", label: "Pause Session", ring: "border-[#3b82f6] text-[#3b82f6]" },
    { value: "28%", label: "Resume", ring: "border-cyan-400 text-cyan-400" },
    { value: "72%", label: "Complete", ring: "border-[#10b981] text-[#10b981]" },
    { value: "48%", label: "Continue Next", ring: "border-[#a855f7] text-[#a855f7]" },
  ]);

  const [funnelData, setFunnelData] = useState([
    { label: "Started", pct: 100, width: "100%", color: "from-[#8b5cf6] to-[#7c3aed]" },
    { label: "Watched 25%", pct: 88, width: "88%", color: "from-[#7c3aed] to-[#3b82f6]" },
    { label: "Watched 50%", pct: 74, width: "74%", color: "from-[#3b82f6] to-[#06b6d4]" },
    { label: "Watched 75%", pct: 61, width: "61%", color: "from-[#06b6d4] to-[#14b8a6]" },
    { label: "Completed", pct: 52, width: "52%", color: "from-[#14b8a6] to-[#10b981]" },
  ]);

  const [selectedCohort, setSelectedCohort] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cohortData = [
    { week: "Wk 1", c1: 100, c2: 100, c3: 100, c4: 100, c5: 100 },
    { week: "Wk 2", c1: 94, c2: 89, c3: 84, c4: 79, c5: 74 },
    { week: "Wk 3", c1: 90, c2: 83, c3: 77, c4: 70, c5: 63 },
    { week: "Wk 4", c1: 87, c2: 79, c3: 71, c4: 63, c5: 55 },
    { week: "Wk 5", c1: 85, c2: 75, c3: 67, c4: 58, c5: 49 },
    { week: "Wk 6", c1: 82, c2: 72, c3: 63, c4: 54, c5: 44 },
    { week: "Wk 7", c1: 80, c2: 69, c3: 59, c4: 49, c5: 39 },
    { week: "Wk 8", c1: 78, c2: 67, c3: 56, c4: 46, c5: 36 },
  ];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/behavior-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.pipeline && data.funnel) {
          const rings = [
            "border-[#8b5cf6] text-[#8b5cf6]",
            "border-[#3b82f6] text-[#3b82f6]",
            "border-cyan-400 text-cyan-400",
            "border-[#10b981] text-[#10b981]",
            "border-[#a855f7] text-[#a855f7]",
          ];
          setPipelineData(
            data.pipeline.map((item: any, idx: number) => ({
              value: item.value,
              label: item.label,
              ring: rings[idx % rings.length],
            }))
          );
          setFunnelData(data.funnel);
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    setToastMessage("Exporting Viewer Journey Funnel & Cohort Survival Data...");
    setTimeout(() => {
      setToastMessage("Cohort Analytics exported successfully.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1000);
  };

  const handleAction = (label: string) => {
    setToastMessage(`Optimization triggered: ${label} threshold applied to active pipeline.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 relative">
      <TopHeader
        title="STREAM PULSE — Viewer Journey & Behavior Analysis"
        subtitle="End-to-end viewer progression, drop-off milestones, and 8-week cohort decay curves."
        searchPlaceholder="Search events, drop-off points..."
        hasSparkleIcon={true}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0f1524] border border-cyan-500/80 shadow-2xl shadow-cyan-500/20 text-xs text-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>50,000 Ingested Viewer Sessions · Real-time Funnel Analysis</span>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101626] border border-[#1a233a] text-xs text-slate-300 hover:text-white hover:border-cyan-500/60 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Funnel Data</span>
        </button>
      </div>

      {/* Section 1: 5-Stage Circular Viewer Journey Pipeline */}
      <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Viewer Journey Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {pipelineData.map((node, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div
                className={`w-20 h-20 rounded-full border-2 ${node.ring} flex items-center justify-center bg-[#0c1220] shadow-lg shadow-purple-950/20 mb-3`}
              >
                <span className="text-lg font-bold font-mono tracking-tight text-white">
                  {node.value}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-300 tracking-wide">
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Drop-Off Funnel + Critical Milestone Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Drop-Off Funnel (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Session Drop-Off Funnel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Viewer attrition through playback milestones (25%, 50%, 75%, 100%)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {funnelData.map((stage) => (
              <div key={stage.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{stage.label}</span>
                  <span className="font-mono text-cyan-400 font-semibold">{stage.pct}%</span>
                </div>
                <div className="h-6 w-full bg-[#101626] rounded-xl overflow-hidden p-0.5 border border-[#1a233a]">
                  <div
                    className={`h-full bg-gradient-to-r ${stage.color} rounded-lg transition-all duration-1000`}
                    style={{ width: `${stage.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-6 border-t border-[#151c2e] pt-3">
            Greatest drop-off observed between 25% and 50% runtime across non-binge titles.
          </p>
        </div>

        {/* Right Column: 2 Critical Milestone Insight Cards (1 Col) */}
        <div className="space-y-6">
          {/* Card 1: Completion Catalyst */}
          <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              <span>Completion Catalyst</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Viewers who cross the <strong className="text-cyan-400">50% milestone</strong> have an{" "}
              <strong className="text-white">88.4% probability</strong> of completing the full season within 7 days.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleAction("Target Mid-Roll Hooks")}
                className="w-full py-2 px-3 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-300 hover:bg-purple-900/60 text-xs font-semibold transition-colors"
              >
                Target Mid-Roll Retention Hooks
              </button>
            </div>
          </div>

          {/* Card 2: Early Attrition Warning */}
          <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span>Early Attrition Warning</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sessions paused within the first <strong className="text-rose-400">8 minutes</strong> show a 4.2x higher likelihood of 30-day subscriber churn.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleAction("Activate Quick-Resume Push")}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold transition-colors"
              >
                Activate Quick-Resume Push
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cohort Retention Curves (8-Week Survival) */}
      <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cohort Retention Decay Curves (8-Week Survival)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Subscriber cohort survival rates tracked weekly from signup cohort ingestion
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">Cohort 1 (Top)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="text-slate-300">Cohort 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span className="text-slate-300">Cohort 3</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-slate-300">Cohort 4</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
              <span className="text-slate-300">Cohort 5</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" stroke="#334155" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis stroke="#334155" tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[30, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1322",
                  borderColor: "#1e293b",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="c1" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="c2" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="c3" stroke="#818cf8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="c4" stroke="#c084fc" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="c5" stroke="#f472b6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
