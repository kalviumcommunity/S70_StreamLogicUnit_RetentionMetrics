"use client";

import React, { useState, useEffect, useRef } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Sparkles, TrendingUp, ChevronDown, Download, CheckCircle2, SlidersHorizontal } from "lucide-react";

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
  const [sortBy, setSortBy] = useState("retention");
  const [sortLabel, setSortLabel] = useState("Rotten Tomatoes %");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [contentRows, setContentRows] = useState<ContentRow[]>(DEFAULT_KAGGLE_ROWS);
  const [investmentScore, setInvestmentScore] = useState(86);
  const [scoreStatus, setScoreStatus] = useState("EXCELLENT");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const filterTabs = ["All", "Netflix", "Prime Video", "Hulu", "Disney+"];

  const sortOptions = [
    { label: "Rotten Tomatoes %", key: "retention" },
    { label: "Completion Rate %", key: "completion" },
    { label: "Watch Time (Hours)", key: "watch_time" },
    { label: "Subscriber Impact", key: "sub_impact" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000/api/content-performance?genre=${encodeURIComponent(selectedFilter)}&sort_by=${sortBy}&limit=7`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setContentRows(data.items);
          if (data.investment_score) setInvestmentScore(data.investment_score);
          if (data.score_status) setScoreStatus(data.score_status);
        }
      })
      .catch(() => {});
  }, [selectedFilter, sortBy]);

  const handleActionClick = (title: string, action: string) => {
    const messages: Record<string, string> = {
      Promote: `AI Action Executed: "${title}" syndicated to Spotlight Hero Carousel (+22% retention boost scheduled).`,
      Expand: `AI Action Executed: "${title}" added to Global Subscriber Acquisition Pipeline.`,
      Monitor: `AI Action Executed: Real-time telemetry alerts activated for "${title}".`,
      Review: `AI Action Executed: Low completion audit report initiated for "${title}".`,
    };
    setToastMessage(messages[action] || `Action "${action}" applied to ${title}.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleExportCSV = () => {
    const headers = ["Title", "Year", "Age", "Rotten Tomatoes", "Platform", "Completion Rate", "Retention Rate", "Subscriber Impact", "Action"];
    const rows = contentRows.map((r) => [
      `"${r.title}"`,
      r.year,
      r.age,
      `"${r.rotten_tomatoes}"`,
      `"${r.genre}"`,
      `"${r.completion}"`,
      `"${r.retention}"`,
      `"${r.subImpact}"`,
      `"${r.action}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `STREAM_PULSE_${selectedFilter}_Content_Metrics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Export Complete: Downloaded ${selectedFilter} content report as CSV.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 relative">
      <TopHeader
        title="Content Performance Intelligence"
        subtitle="Live predictive intelligence across 9,515 Kaggle OTT titles with Rotten Tomatoes scores."
        searchPlaceholder="Search movies, scores, platforms..."
        hasSparkleIcon={true}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0f1524] border border-cyan-500/80 shadow-2xl shadow-cyan-500/20 text-xs text-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Filter, Sort & Export Bar */}
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
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101626] border border-[#1a233a] text-slate-300 hover:text-white hover:border-cyan-500/60 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101626] border border-[#1a233a] text-white font-medium hover:border-slate-600 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span>{sortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 p-1.5 rounded-xl bg-[#0f1524] border border-[#182238] shadow-2xl z-50 space-y-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSortBy(opt.key);
                      setSortLabel(opt.label);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === opt.key
                        ? "bg-purple-950/60 text-purple-300 font-semibold"
                        : "text-slate-300 hover:bg-[#151e33] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
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
                      onClick={() => handleActionClick(row.title, row.action)}
                      className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition-transform active:scale-95 cursor-pointer ${row.actionColor}`}
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
              <div
                onClick={() => handleActionClick("The Irishman", "Promote")}
                className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1 cursor-pointer hover:border-purple-600/60 transition-colors"
              >
                <h4 className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Renew &amp; Spotlight &quot;The Irishman&quot;</span>
                  <span className="text-[10px] text-purple-400 font-mono">EXECUTE ↗</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Has 98/100 Rotten Tomatoes score and highest cohort retention curve. Predicted renewal ROI is +34%.
                </p>
              </div>

              {/* Action 2 */}
              <div
                onClick={() => handleActionClick("Dangal", "Expand")}
                className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1 cursor-pointer hover:border-purple-600/60 transition-colors"
              >
                <h4 className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Feature &quot;Dangal&quot; Global Carousel</span>
                  <span className="text-[10px] text-purple-400 font-mono">EXECUTE ↗</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Outstanding completion affinity (97/100 RT). Target re-engagement push to international cohorts.
                </p>
              </div>

              {/* Action 3 */}
              <div
                onClick={() => handleActionClick("David Attenborough", "Expand")}
                className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1 cursor-pointer hover:border-purple-600/60 transition-colors"
              >
                <h4 className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>License Nature &amp; Doc Spin-offs</span>
                  <span className="text-[10px] text-purple-400 font-mono">EXECUTE ↗</span>
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
