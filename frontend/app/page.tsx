"use client";

import React, { useEffect, useState } from "react";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard } from "@/components/ChartCard";
import { api, EngagementSummary } from "@/lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function OverviewPage() {
  const [data, setData] = useState<EngagementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);
        const summaries = await api.getEngagementSummary();
        setData(summaries);
      } catch (err: any) {
        setError(err.message || "Could not connect to StreamPulse API");
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const totalSessions = data.reduce((acc, curr) => acc + curr.session_count, 0);
  const avgCompletion =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + curr.avg_completion_rate, 0) /
          data.length
        ).toFixed(1)
      : "0.0";
  const retentionRate = "86.4%";
  const atRiskCount = "412";

  // Trend data mapped from genre volume
  const trendData = data.map((d) => ({
    name: d.genre,
    completion: d.avg_completion_rate,
    sessions: d.session_count,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Executive Retention & Engagement Overview
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          High-level subscriber health, engagement distribution, and retention forecasting.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Logged Sessions"
          value={loading ? "..." : totalSessions.toLocaleString()}
          subtitle="Across all active catalog titles"
          change="+8.4%"
          isPositive={true}
          loading={loading}
        />
        <KpiCard
          title="Avg Completion Rate"
          value={loading ? "..." : `${avgCompletion}%`}
          subtitle="Benchmark: >75% target"
          change="+3.1%"
          isPositive={true}
          loading={loading}
        />
        <KpiCard
          title="30-Day Retention Rate"
          value={retentionRate}
          subtitle="Active subscriber cohort"
          riskVariant="low"
          change="+1.8%"
          isPositive={true}
          loading={loading}
        />
        <KpiCard
          title="Active At-Risk Subscribers"
          value={atRiskCount}
          subtitle="Inactivity > 7 days"
          riskVariant="high"
          change="-4.2%"
          isPositive={true}
          loading={loading}
        />
      </div>

      {/* Main Trend Chart */}
      <ChartCard
        title="Engagement & Completion Trajectory by Genre"
        subtitle="Cross-sectional completion rate (%) vs. session volume"
        loading={loading}
        error={error}
        empty={data.length === 0}
      >
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111726",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
              />
              <Area
                type="monotone"
                dataKey="completion"
                name="Avg Completion Rate (%)"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCompletion)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
