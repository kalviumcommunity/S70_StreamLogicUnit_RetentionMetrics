"use client";

import React, { useEffect, useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { api, RetentionDriver, PredictResponse } from "@/lib/api";
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

export default function RetentionPage() {
  const [drivers, setDrivers] = useState<RetentionDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Predictor state
  const [completionRate, setCompletionRate] = useState(82.0);
  const [watchDuration, setWatchDuration] = useState(45.0);
  const [sessionCount, setSessionCount] = useState(14);
  const [daysInactive, setDaysInactive] = useState(3);
  const [bingeScore, setBingeScore] = useState(3.5);
  const [pauseRate, setPauseRate] = useState(0.04);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    async function loadDrivers() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getRetentionDrivers();
        setDrivers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load retention drivers");
      } finally {
        setLoading(false);
      }
    }
    loadDrivers();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPredicting(true);
      const res = await api.predictRisk({
        avg_completion_rate: Number(completionRate),
        avg_watch_duration: Number(watchDuration),
        session_count: Number(sessionCount),
        days_since_last_session: Number(daysInactive),
        binge_score: Number(bingeScore),
        pause_rate: Number(pauseRate),
      });
      setPredictResult(res);
    } catch (err: any) {
      alert("Prediction error: " + err.message);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Machine Learning Retention Drivers
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Ranked algorithmic feature importances explaining why subscribers retain or churn.
        </p>
      </div>

      {/* Feature Importance & Interpretation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ChartCard
            title="Ranked Feature Importance"
            subtitle="Relative contribution of engagement signals to churn classification"
            loading={loading}
            error={error}
            empty={drivers.length === 0}
          >
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={drivers} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111726",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="importance" name="Importance Score" radius={[0, 4, 4, 0]}>
                    {drivers.map((_, index) => (
                      <Cell
                        key={`driver-cell-${index}`}
                        fill={index === 0 ? "#38bdf8" : index === 1 ? "#6366f1" : "#0284c7"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Interpretations List */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-6 flex flex-col">
          <h3 className="text-base font-semibold text-text-primary mb-3">
            Plain-Language Drivers & Action Items
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Automated recommendations generated for Growth & Product teams:
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {drivers.map((driver, idx) => (
              <div
                key={driver.feature}
                className="p-3 rounded-lg bg-surface-elevated/70 border border-border/80"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-primary font-mono">
                    #{idx + 1} {driver.feature}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    {(driver.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {driver.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Churn Risk Simulator */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-text-primary">
            Live Subscriber Churn Risk Simulator
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Test real-time predictions by invoking the trained model via <code className="text-primary font-mono">POST /api/predict</code>.
          </p>
        </div>

        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-text-secondary font-medium block mb-1">
              Avg Completion Rate (%)
            </label>
            <input
              type="number"
              value={completionRate}
              onChange={(e) => setCompletionRate(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary font-medium block mb-1">
              Avg Watch Duration (min)
            </label>
            <input
              type="number"
              value={watchDuration}
              onChange={(e) => setWatchDuration(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary font-medium block mb-1">
              Session Count
            </label>
            <input
              type="number"
              value={sessionCount}
              onChange={(e) => setSessionCount(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary font-medium block mb-1">
              Days Since Last Session
            </label>
            <input
              type="number"
              value={daysInactive}
              onChange={(e) => setDaysInactive(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary font-medium block mb-1">
              Binge Score (0-10)
            </label>
            <input
              type="number"
              step="0.1"
              value={bingeScore}
              onChange={(e) => setBingeScore(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary font-medium block mb-1">
              Pause Rate (pauses/min)
            </label>
            <input
              type="number"
              step="0.01"
              value={pauseRate}
              onChange={(e) => setPauseRate(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={predicting}
              className="bg-primary hover:bg-primary-hover text-background font-semibold px-5 py-2 rounded-lg text-sm transition-all"
            >
              {predicting ? "Scoring Subscriber..." : "Compute Churn Risk"}
            </button>

            {predictResult && (
              <div className="flex items-center space-x-3 bg-surface-elevated px-4 py-2 rounded-lg border border-border">
                <span className="text-xs text-text-secondary">Predicted Risk:</span>
                <span className="text-sm font-mono font-bold text-text-primary">
                  {(predictResult.risk_score * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full ${
                    predictResult.risk_label === "low"
                      ? "bg-risk-low/20 text-risk-low"
                      : predictResult.risk_label === "medium"
                      ? "bg-risk-medium/20 text-risk-medium"
                      : "bg-risk-high/20 text-risk-high"
                  }`}
                >
                  {predictResult.risk_label} risk
                </span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
