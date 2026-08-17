"use client";

import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { ChartCard } from "@/components/ChartCard";
import { api, EngagementSummary } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export default function EngagementPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [data, setData] = useState<EngagementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const summaries = await api.getEngagementSummary(selectedGenre);
        setData(summaries);
      } catch (err: any) {
        setError(err.message || "Failed to fetch engagement analytics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedGenre]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Engagement Deep-Dive
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Detailed breakdown of subscriber watch patterns, session durations, and pause friction.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedGenre={selectedGenre}
        onGenreChange={(genre) => setSelectedGenre(genre)}
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watch Duration Chart */}
        <ChartCard
          title="Average Watch Duration (Minutes)"
          subtitle="Mean minutes per viewing session by genre"
          loading={loading}
          error={error}
          empty={data.length === 0}
        >
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="genre" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111726",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="avg_watch_duration" name="Watch Duration (min)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Completion Rate Chart */}
        <ChartCard
          title="Average Completion Rate (%)"
          subtitle="Percentage of content consumed before session exit"
          loading={loading}
          error={error}
          empty={data.length === 0}
        >
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="genre" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111726",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="avg_completion_rate" name="Completion Rate (%)" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.avg_completion_rate >= 80
                          ? "#10b981"
                          : entry.avg_completion_rate >= 70
                          ? "#38bdf8"
                          : "#f59e0b"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Session Frequency Breakdown */}
      <ChartCard
        title="Session Volume Distribution"
        subtitle="Total recorded sessions contributing to engagement benchmarks"
        loading={loading}
        error={error}
        empty={data.length === 0}
      >
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis dataKey="genre" type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111726",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="session_count" name="Total Sessions" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
