"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Sparkles, TrendingUp, ChevronDown } from "lucide-react";

interface ContentRow {
  title: string;
  year: string;
  age: string;
  rotten_tomatoes: string;
  genre: string;
  watchTime: string;
  completion: string;
  retention: string;
  retentionHighlight: boolean;
  subImpact: string;
  impactPositive: boolean;
  isTrending: boolean;
  action: string;
  actionColor: string;
}

const DEFAULT_KAGGLE_ROWS: ContentRow[] = [
  {
    title: "The Irishman",
    year: "2019",
    age: "18+",
    rotten_tomatoes: "98/100",
    genre: "Netflix",
    watchTime: "14.2K hrs",
    completion: "89%",
    retention: "98%",
    retentionHighlight: true,
    subImpact: "+2.4K",
    impactPositive: true,
    isTrending: true,
    action: "Promote",
    actionColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60",
  },
  {
    title: "Dangal",
    year: "2016",
    age: "7+",
    rotten_tomatoes: "97/100",
    genre: "Netflix",
    watchTime: "11.8K hrs",
    completion: "92%",
    retention: "97%",
    retentionHighlight: true,
    subImpact: "+2.1K",
    impactPositive: true,
    isTrending: true,
    action: "Promote",
    actionColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60",
  },
  {
    title: "David Attenborough: A Life on Our Planet",
    year: "2020",
    age: "7+",
    rotten_tomatoes: "95/100",
    genre: "Netflix",
    watchTime: "9.5K hrs",
    completion: "86%",
    retention: "95%",
    retentionHighlight: true,
    subImpact: "+1.8K",
    impactPositive: true,
    isTrending: true,
    action: "Promote",
    actionColor: "bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60",
  },
  {
    title: "Lagaan: Once Upon a Time in India",
    year: "2001",
    age: "7+",
    rotten_tomatoes: "94/100",
    genre: "Netflix",
    watchTime: "8.9K hrs",
    completion: "81%",
    retention: "94%",
    retentionHighlight: true,
    subImpact: "+1.4K",
    impactPositive: true,
    isTrending: true,
    action: "Expand",
    actionColor: "bg-purple-950/60 text-purple-400 border-purple-800/80 hover:bg-purple-900/60",
  },
  {
    title: "Roma",
    year: "2018",
    age: "18+",
    rotten_tomatoes: "94/100",
    genre: "Netflix",
    watchTime: "8.2K hrs",
    completion: "78%",
    retention: "94%",
    retentionHighlight: true,
    subImpact: "+1.2K",
    impactPositive: true,
    isTrending: true,
    action: "Expand",
    actionColor: "bg-purple-950/60 text-purple-400 border-purple-800/80 hover:bg-purple-900/60",
  },
  {
    title: "The Social Dilemma",
    year: "2020",
    age: "13+",
    rotten_tomatoes: "93/100",
    genre: "Netflix",
    watchTime: "7.6K hrs",
    completion: "74%",
    retention: "93%",
    retentionHighlight: true,
    subImpact: "+950",
    impactPositive: true,
    isTrending: true,
    action: "Monitor",
    actionColor: "bg-cyan-950/60 text-cyan-400 border-cyan-800/80 hover:bg-cyan-900/60",
  },
];

export default function ContentPerformancePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [contentRows, setContentRows] = useState<ContentRow[]>(DEFAULT_KAGGLE_ROWS);
  const [investmentScore, setInvestmentScore] = useState(86);
  const [scoreStatus, setScoreStatus] = useState("EXCELLENT");

  const filterTabs = ["All", "Netflix", "Prime Video", "Hulu", "Disney+"];

  useEffect(() => {
    fetch(`http://localhost:8000/api/content-performance?genre=${encodeURIComponent(selectedFilter)}&limit=6`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setContentRows(data.items);
          if (data.investment_score) setInvestmentScore(data.investment_score);
          if (data.score_status) setScoreStatus(data.score_status);
        }
      })
      .catch(() => {});
  }, [selectedFilter]);

  return (
    <div className="space-y-6">
      <TopHeader
        title="Content Performance Intelligence"
        subtitle="Live predictive intelligence across 9,515 Kaggle OTT titles with Rotten Tomatoes scores."
        searchPlaceholder="Search movies, scores, platforms..."
        hasSparkleIcon={true}
      />

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((g) => {
            const active = selectedFilter === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedFilter(g)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#8b5cf6] text-white shadow-lg shadow-purple-600/30"
                    : "bg-[#101626] text-slate-400 border border-[#1a233a] hover:text-white hover:border-slate-600"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:inline">Kaggle Dataset: <strong className="text-white font-mono">9,515</strong> verified records</span>
          
          <div className="flex items-center gap-2">
            <span>Sorted by:</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101626] border border-[#1a233a] text-white font-medium hover:border-slate-600 transition-colors">
              <span>Rotten Tomatoes %</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Content Performance Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#182238]">
                <th className="pb-4 font-semibold">TITLE</th>
                <th className="pb-4 font-semibold">YEAR / AGE</th>
                <th className="pb-4 font-semibold">ROTTEN TOMATOES</th>
                <th className="pb-4 font-semibold">PLATFORM</th>
                <th className="pb-4 font-semibold">RETENTION %</th>
                <th className="pb-4 font-semibold">SUB IMPACT</th>
                <th className="pb-4 font-semibold text-right">AI ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151c2e]">
              {contentRows.map((row) => (
                <tr key={row.title} className="hover:bg-[#131b2e] transition-colors">
                  <td className="py-4 font-semibold text-white flex items-center gap-2">
                    {row.isTrending && (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate max-w-[190px]" title={row.title}>{row.title}</span>
                  </td>
                  <td className="py-4 text-slate-400 font-mono">{row.year} · {row.age}</td>
                  <td className="py-4 font-semibold text-cyan-400 font-mono">{row.rotten_tomatoes}</td>
                  <td className="py-4 text-slate-300">{row.genre}</td>
                  <td className="py-4 font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <span>{row.retention}</span>
                      {row.retentionHighlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </span>
                  </td>
                  <td
                    className={`py-4 font-semibold ${
                      row.impactPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {row.subImpact}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${row.actionColor}`}
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Score & Top Recommended Actions */}
        <div className="space-y-6">
          {/* Content Investment Score Card */}
          <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm flex flex-col items-center text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 self-start">
              CONTENT INVESTMENT SCORE
            </h3>

            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#182238] fill-none"
                  strokeWidth="10"
                />
                {/* Active Cyan Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-cyan-400 fill-none transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="35.2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {investmentScore}
                </span>
                <span className="text-[11px] font-bold text-cyan-400 tracking-wider mt-0.5">
                  {scoreStatus}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your OTT catalog retention health is 14% higher than last quarter.
            </p>
          </div>

          {/* Top Recommended Actions Card */}
          <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              <span>Top Recommended Actions</span>
            </div>

            <div className="space-y-3">
              {/* Action 1 */}
              <div className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1">
                <h4 className="text-xs font-semibold text-white">
                  Renew &amp; Spotlight &quot;The Irishman&quot;
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Has 98/100 Rotten Tomatoes score and highest cohort retention curve. Predicted renewal ROI is +34%.
                </p>
              </div>

              {/* Action 2 */}
              <div className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1">
                <h4 className="text-xs font-semibold text-white">
                  Feature &quot;Dangal&quot; Global Carousel
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Outstanding completion affinity (97/100 RT). Target re-engagement push to international cohorts.
                </p>
              </div>

              {/* Action 3 */}
              <div className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1">
                <h4 className="text-xs font-semibold text-white">
                  License Nature &amp; Doc Spin-offs
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  David Attenborough catalog segment expanded by 22%. Licensing natural history holds low churn risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
