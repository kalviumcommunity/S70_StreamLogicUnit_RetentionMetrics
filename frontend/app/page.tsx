"use client";

import React, { useEffect, useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, Calendar, CheckCircle2, Sliders } from "lucide-react";

export default function DashboardOverviewPage() {
  const [retentionSummary, setRetentionSummary] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/retention-summary")
      .then((res) => res.json())
      .then((data) => setRetentionSummary(data))
      .catch(() => {});
  }, []);

  const trendData = [
    { month: "Jan", retention: 84, duration: 26 },
    { month: "Feb", retention: 82, duration: 32 },
    { month: "Mar", retention: 80, duration: 37 },
    { month: "Apr", retention: 83, duration: 41 },
    { month: "May", retention: 85, duration: 45 },
    { month: "Jun", retention: 88, duration: 47 },
  ];

  const topShows = [
    { title: "The Irishman", score: 98, color: "from-cyan-400 to-cyan-500" },
    { title: "Dangal", score: 97, color: "from-cyan-500 to-blue-500" },
    { title: "David Attenborough: A Life on Our Planet", score: 95, color: "from-blue-500 to-indigo-500" },
    { title: "Roma", score: 94, color: "from-indigo-500 to-purple-500" },
    { title: "The Social Dilemma", score: 93, color: "from-purple-500 to-pink-500" },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeLabels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "11 PM"];

  // Heatmap intensity matching screenshot distribution
  const getCellColor = (dayIdx: number, hour: number): string => {
    if (hour < 5) return "#101626";
    if (hour < 8) return dayIdx >= 4 ? "#1e243d" : "#141a2e";
    if (hour >= 8 && hour < 16) {
      if (dayIdx >= 4) return hour % 2 === 0 ? "#06b6d4" : "#8b5cf6";
      return hour % 3 === 0 ? "#8b5cf6" : "#242b47";
    }
    if (hour >= 16 && hour <= 23) {
      if (dayIdx >= 3) return hour % 2 === 0 ? "#06b6d4" : "#22d3ee";
      return hour % 2 === 0 ? "#8b5cf6" : "#06b6d4";
    }
    return "#171e33";
  };

  const handleExport = () => {
    setToastMessage("Generating Stream Pulse Executive Summary Report (PDF/CSV)...");
    setTimeout(() => {
      setToastMessage("Executive Overview exported successfully.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 relative">
      <TopHeader
        title="STREAM PULSE — OTT Performance Overview"
        subtitle="Real-time retention, subscriber health, and Kaggle content telemetry across platforms."
        searchPlaceholder="Search analytics, shows, cohorts..."
        hasSparkleIcon={true}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0f1524] border border-cyan-500/80 shadow-2xl shadow-cyan-500/20 text-xs text-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Quick Action Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Telemetry Connected · 50,000 Active Sessions</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="relative">
            <button
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101626] border border-[#1a233a] text-xs text-slate-200 hover:border-slate-600 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timeRange}</span>
            </button>

            {rangeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 p-1.5 rounded-xl bg-[#0f1524] border border-[#182238] shadow-2xl z-50 space-y-1 text-xs">
                {["Last 7 Days", "Last 30 Days", "Last Quarter", "Full Year"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setTimeRange(r);
                      setRangeDropdownOpen(false);
                      setToastMessage(`Time window adjusted to ${r}.`);
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                      timeRange === r ? "bg-purple-950/60 text-purple-300 font-semibold" : "text-slate-300 hover:bg-[#151e33]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101626] border border-[#1a233a] text-xs text-slate-300 hover:text-white hover:border-cyan-500/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Dashboard</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (4 Top Metrics matching Screen 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            30-Day Retention Rate
          </p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              {retentionSummary ? `${retentionSummary.retention_rate_pct}%` : "87.4%"}
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
              +2.3%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">vs. previous period</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Avg Watch Time / User
          </p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              4.2 hrs
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
              +8.1%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">weekly average</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Churn Risk Flagged
          </p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              {retentionSummary ? `${retentionSummary.churn_rate_pct}%` : "12.6%"}
            </span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/40">
              -1.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">predicted next 14 days</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Active Subscriber Base
          </p>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              {retentionSummary ? `${retentionSummary.active_subscribers.toLocaleString()}` : "1.42M"}
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
              +14.2K
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">net gain this month</p>
        </div>
      </div>

      {/* Middle Row: Line Chart + Top Performing Shows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Trend Dual-Line Chart (Left 2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Retention vs. Watch Time Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly correlation between engagement duration and subscriber renewal
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Retention %</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span className="text-slate-300">Watch Time (hrs)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#334155" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis stroke="#334155" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1322",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22d3ee" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#c084fc"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#c084fc" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Shows (Right 1 Column) */}
        <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Performing Kaggle Shows
            </h3>
            <span className="text-xs font-medium text-cyan-400 cursor-pointer hover:underline">
              View All
            </span>
          </div>

          <div className="space-y-4">
            {topShows.map((show) => (
              <div key={show.title} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate pr-2" title={show.title}>
                    {show.title}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">{show.score}%</span>
                </div>
                <div className="h-2 w-full bg-[#12192c] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${show.color} rounded-full`}
                    style={{ width: `${show.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 border-t border-[#151c2e] pt-3">
            Ranked by aggregate Rotten Tomatoes score &amp; completion affinity.
          </p>
        </div>
      </div>

      {/* Bottom Section: Hourly Engagement Heatmap Matrix (7 x 24) */}
      <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Viewer Engagement Heatmap (7 Days × 24 Hours)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live streaming density distribution across peak evening and weekend binge cycles
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Low</span>
            <div className="flex gap-1">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#101626] border border-[#1e243d]"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-[#242b47]"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-[#8b5cf6]"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-[#06b6d4]"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-[#22d3ee]"></span>
            </div>
            <span className="text-slate-400">Peak Binge</span>
          </div>
        </div>

        {/* 7 Days Matrix */}
        <div className="space-y-2 overflow-x-auto pb-2">
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-2 min-w-[700px]">
              <span className="w-10 text-xs font-medium text-slate-400 shrink-0">{day}</span>
              <div className="flex-1 flex gap-1">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const bg = getCellColor(dayIdx, hour);
                  return (
                    <div
                      key={hour}
                      className="h-6 flex-1 rounded-sm cursor-pointer transition-transform hover:scale-110 hover:z-10 relative group"
                      style={{ backgroundColor: bg }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#0d1322] border border-[#1e293b] text-white text-[10px] font-mono py-0.5 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50">
                        {day} {hour}:00 · Density: {hour >= 18 ? "Peak" : hour >= 10 ? "Moderate" : "Low"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Time scale row */}
          <div className="flex items-center gap-2 min-w-[700px] pt-2">
            <span className="w-10"></span>
            <div className="flex-1 flex justify-between text-[10px] text-slate-400 font-mono px-1">
              {timeLabels.map((lbl) => (
                <span key={lbl}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
