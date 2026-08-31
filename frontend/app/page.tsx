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

export default function DashboardOverviewPage() {
  const [retentionSummary, setRetentionSummary] = useState<any>(null);

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
    { title: "Midnight Protocol", score: 95, color: "from-cyan-400 to-cyan-500" },
    { title: "The Last Frontier", score: 84, color: "from-cyan-500 to-blue-500" },
    { title: "Code Zero", score: 78, color: "from-blue-500 to-indigo-500" },
    { title: "Shadow Network", score: 71, color: "from-indigo-500 to-purple-500" },
    { title: "Echoes", score: 62, color: "from-purple-500 to-pink-500" },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeLabels = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "11 PM"];

  // Heatmap intensity matching screenshot distribution
  const getCellColor = (dayIdx: number, hour: number): string => {
    // Early morning 12 AM - 6 AM
    if (hour < 5) return "#101626";
    if (hour < 8) return dayIdx >= 4 ? "#1e243d" : "#141a2e";
    
    // Mid morning to afternoon 8 AM - 4 PM
    if (hour >= 8 && hour < 16) {
      if (dayIdx >= 4) return hour % 2 === 0 ? "#06b6d4" : "#8b5cf6";
      return hour % 3 === 0 ? "#8b5cf6" : "#242b47";
    }

    // Peak Evening 4 PM - 11 PM
    if (hour >= 16 && hour <= 23) {
      if (dayIdx >= 3) return hour % 2 === 0 ? "#06b6d4" : "#22d3ee";
      return hour % 2 === 0 ? "#8b5cf6" : "#06b6d4";
    }

    return "#171e33";
  };

  return (
    <div className="space-y-6">
      <TopHeader
        title="OTT Performance Overview"
        subtitle="Real-time retention and content metrics across all platforms."
        searchPlaceholder="Search analytics, shows..."
      />

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Watch Duration */}
        <div className="p-5 rounded-2xl bg-[#0c1220] border border-[#162035] relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              WATCH DURATION
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +12%
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            47m
          </div>
          <div className="mt-1 text-xs text-slate-400">avg. per session</div>
        </div>

        {/* Pause Frequency */}
        <div className="p-5 rounded-2xl bg-[#0c1220] border border-[#162035] relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              PAUSE FREQUENCY
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              -8%
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            3.2
          </div>
          <div className="mt-1 text-xs text-slate-400">per episode avg.</div>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-[#0c1220] border border-[#162035] relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              COMPLETION RATE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +5.3%
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            72.4%
          </div>
          <div className="mt-1 text-xs text-slate-400">overall average</div>
        </div>

        {/* Retention Score */}
        <div className="p-5 rounded-2xl bg-[#0c1220] border border-[#162035] relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              RETENTION SCORE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +0.4
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            8.6
          </div>
          <div className="mt-1 text-xs text-slate-400">out of 10 score</div>
        </div>
      </div>

      {/* Middle Grid: Line Chart & Top Performing Shows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention vs Watch Duration Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c1220] border border-[#162035] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white">
              Retention vs Watch Duration
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#8b5cf6] rounded-full"></span>
                <span className="text-slate-300">Retention %</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full"></span>
                <span className="text-slate-300">Watch Duration (mins)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#080c14",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: "#8b5cf6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={{ fill: "#22d3ee", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Shows */}
        <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-6">Top Performing Shows</h3>

            <div className="space-y-4">
              {topShows.map((show) => (
                <div key={show.title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{show.title}</span>
                    <span className="font-bold text-cyan-400">{show.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#141b2d] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${show.color}`}
                      style={{ width: `${show.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement by Time of Day Heatmap */}
      <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h3 className="text-sm font-bold text-white">Engagement by Time of Day</h3>
          
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
            <span>LOW</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#101626" }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#1e243d" }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#06b6d4" }} />
            </div>
            <span>PEAK</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: "620px" }}>
            {days.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-3 mb-1.5">
                <span className="w-8 text-[11px] font-semibold text-slate-400 text-right shrink-0">
                  {day}
                </span>
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <div
                      key={hour}
                      className="h-4 rounded-sm flex-1 transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: getCellColor(dayIdx, hour) }}
                      title={`${day} @ ${hour}:00`}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3 mt-2">
              <span className="w-8 shrink-0" />
              <div className="flex flex-1 justify-between px-1">
                {timeLabels.map((time) => (
                  <span key={time} className="text-[10px] text-slate-500">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
