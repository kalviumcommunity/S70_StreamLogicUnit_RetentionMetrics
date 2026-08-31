"use client";

import React, { useEffect, useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Sparkles } from "lucide-react";
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
    fetch("http://localhost:8000/api/behavior-stats")
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

          const colors = [
            "from-[#8b5cf6] to-[#7c3aed]",
            "from-[#7c3aed] to-[#3b82f6]",
            "from-[#3b82f6] to-[#06b6d4]",
            "from-[#06b6d4] to-[#14b8a6]",
            "from-[#14b8a6] to-[#10b981]",
          ];
          setFunnelData(
            data.funnel.map((item: any, idx: number) => ({
              label: item.label,
              pct: Math.round(item.pct),
              width: `${Math.round(item.pct)}%`,
              color: colors[idx % colors.length],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <TopHeader
        title="Viewer Journey & Behavior Analysis"
        subtitle="Trace interactive paths, step funnels, and demographic cohort retention."
        searchPlaceholder="Search viewers, habits..."
      />

      {/* Top Card: Viewer Journey & Event Pipeline */}
      <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold text-white">
            Viewer Journey & Event Pipeline
          </h3>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#141b2d] text-slate-300 border border-[#1e293b] tracking-wider uppercase">
            ACTIVE PATH FLOW
          </span>
        </div>

        <div className="flex items-center justify-between relative px-4 sm:px-12 py-2 overflow-x-auto">
          {pipelineData.map((node, idx) => (
            <React.Fragment key={node.label}>
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${node.ring} bg-[#080c14] flex items-center justify-center font-bold text-base sm:text-lg shadow-lg shadow-black/50`}
                >
                  {node.value}
                </div>
                <span className="text-xs text-slate-300 font-medium mt-3 whitespace-nowrap">
                  {node.label}
                </span>
              </div>

              {idx < pipelineData.length - 1 && (
                <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-700 via-cyan-500/50 to-slate-700 -mt-6 mx-2 min-w-[24px]"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Middle Grid: Funnel + Catalyst Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Episode Drop-off Funnel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c1220] border border-[#162035] shadow-sm">
          <h3 className="text-sm font-bold text-white mb-6">
            Episode Drop-off Funnel
          </h3>

          <div className="space-y-4">
            {funnelData.map((step) => (
              <div key={step.label} className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-3 text-xs font-medium text-slate-300">
                  {step.label}
                </span>
                <div className="col-span-8 h-8 bg-[#141b2d] rounded-lg overflow-hidden flex items-center p-0.5">
                  <div
                    className={`h-full rounded-md bg-gradient-to-r ${step.color} transition-all duration-500`}
                    style={{ width: step.width }}
                  ></div>
                </div>
                <span className="col-span-1 text-xs font-bold text-white text-right">
                  {step.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2 Stacked Insight Cards */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Completion Catalyst */}
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-[#162035] space-y-3 flex-1 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                <Sparkles className="w-4 h-4 fill-purple-400/20" />
                <span>Completion Catalyst</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Episodes with &gt;75% completion retain 2.4x more users throughout the overall season lifecycle.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#162035]">
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                UPWARD TREND
              </span>
              <svg className="w-20 h-6 text-emerald-400" viewBox="0 0 100 30" fill="none">
                <path d="M0 25 L30 18 L60 20 L80 8 L100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Early Attrition Signal */}
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-[#162035] space-y-3 flex-1 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Sparkles className="w-4 h-4 fill-cyan-400/20" />
                <span>Early Attrition Signal</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Frequent pauses in the first 5 minutes correlate strictly with a lower final retention curve.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#162035]">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider">
                PAUSE DENSITY
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Weekly Cohort Retention Curves */}
      <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">
              Weekly Cohort Retention Curves
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compares initial signup retention rate decay across consecutive weeks.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8b5cf6] rounded"></span>
              <span className="text-slate-300">Latest Cohorts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#475569] rounded"></span>
              <span className="text-slate-400">Older Cohorts</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#080c14",
                  borderColor: "#1e293b",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="c1" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 3 }} />
              <Line type="monotone" dataKey="c2" stroke="#7c3aed" strokeWidth={1.8} dot={{ fill: "#7c3aed", r: 2.5 }} />
              <Line type="monotone" dataKey="c3" stroke="#6366f1" strokeWidth={1.5} dot={{ fill: "#6366f1", r: 2 }} />
              <Line type="monotone" dataKey="c4" stroke="#475569" strokeWidth={1.2} dot={{ fill: "#475569", r: 2 }} />
              <Line type="monotone" dataKey="c5" stroke="#334155" strokeWidth={1} dot={{ fill: "#334155", r: 1.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
