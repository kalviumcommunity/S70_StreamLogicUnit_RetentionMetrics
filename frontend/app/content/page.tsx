"use client";

import React, { useEffect, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { api, ContentInsight } from "@/lib/api";
import { Film, Award, TrendingUp } from "lucide-react";

export default function ContentInsightsPage() {
  const [contentList, setContentList] = useState<ContentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getContentInsights(10);
        setContentList(data);
      } catch (err: any) {
        setError(err.message || "Failed to load content insights");
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Content & Genre Acquisition Insights
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Catalog performance rankings to guide evidence-based acquisition and renewal decisions.
        </p>
      </div>

      {/* Top Content Table Card */}
      <ChartCard
        title="Top 10 High-Retention Catalog Titles"
        subtitle="Ranked by average subscriber completion rate and engagement volume"
        loading={loading}
        error={error}
        empty={contentList.length === 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-muted">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4 text-right">Avg Completion</th>
                <th className="py-3 px-4 text-right">Total Sessions</th>
                <th className="py-3 px-4 text-center">Acquisition Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {contentList.map((item, idx) => (
                <tr
                  key={item.content_id}
                  className="hover:bg-surface-elevated/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-text-muted">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-text-primary flex items-center space-x-2">
                    <Film className="w-4 h-4 text-primary shrink-0" />
                    <span>{item.title}</span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated font-medium">
                      {item.genre}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-risk-low">
                    {item.avg_completion_rate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-text-secondary">
                    {item.total_sessions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.avg_completion_rate >= 85
                          ? "bg-risk-low/10 text-risk-low"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>{item.avg_completion_rate >= 85 ? "High Priority" : "Renew"}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Content Strategy Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-surface border border-border rounded-xl">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-text-primary">Sci-Fi & Drama Retention</h4>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Serialized Sci-Fi and Drama titles have over 88% average completion rates, driving the highest 60-day renewal probabilities.
          </p>
        </div>

        <div className="p-5 bg-surface border border-border rounded-xl">
          <div className="flex items-center space-x-2 text-risk-medium mb-2">
            <Award className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-text-primary">Comedy Volume Play</h4>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Comedy titles produce lower per-session completion (68–74%) but drive frequent weekday micro-sessions that prevent inactivity churn.
          </p>
        </div>

        <div className="p-5 bg-surface border border-border rounded-xl">
          <div className="flex items-center space-x-2 text-risk-low mb-2">
            <Film className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-text-primary">Acquisition Rule</h4>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Greenlight new content acquisitions that match high-completion story structures and maintain mid-length 40-55 minute episodic runtimes.
          </p>
        </div>
      </div>
    </div>
  );
}
