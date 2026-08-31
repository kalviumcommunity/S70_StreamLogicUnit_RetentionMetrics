"use client";

import React, { useEffect, useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Sparkles, Cpu } from "lucide-react";

export default function RetentionRecommendationsPage() {
  const [completionRate, setCompletionRate] = useState(75.0);
  const [watchDuration, setWatchDuration] = useState(45.0);
  const [sessionCount, setSessionCount] = useState(12);
  const [daysInactive, setDaysInactive] = useState(3);
  const [bingeScore, setBingeScore] = useState(3.5);
  const [pauseRate, setPauseRate] = useState(0.08);

  const [riskScore, setRiskScore] = useState(0.28);
  const [riskTier, setRiskTier] = useState<"low" | "medium" | "high">("low");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function runInference() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avg_completion_rate: Number(completionRate),
            avg_watch_duration: Number(watchDuration),
            session_count: Number(sessionCount),
            days_since_last_session: Number(daysInactive),
            binge_score: Number(bingeScore),
            pause_rate: Number(pauseRate),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setRiskScore(data.risk_score);
          setRiskTier(data.risk_label);
        }
      } catch {
        const score = Math.min(
          Math.max(
            (1.0 - completionRate / 100) * 0.4 +
              Math.min(daysInactive / 20, 1.0) * 0.25 +
              Math.max(1.0 - watchDuration / 60, 0) * 0.2 +
              Math.min(pauseRate * 3.0, 1.0) * 0.15,
            0.05
          ),
          0.95
        );
        setRiskScore(Number(score.toFixed(2)));
        setRiskTier(score < 0.35 ? "low" : score < 0.65 ? "medium" : "high");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(runInference, 150);
    return () => clearTimeout(timer);
  }, [completionRate, watchDuration, sessionCount, daysInactive, bingeScore, pauseRate]);

  const driversList = [
    { name: "Completion Rate", importance: 36.4, signal: "Strongest retention predictor", color: "from-cyan-400 to-blue-500" },
    { name: "Watch Duration", importance: 33.4, signal: "Higher duration correlates with multi-month tenure", color: "from-blue-500 to-indigo-500" },
    { name: "Pause Rate", importance: 18.1, signal: "Playback friction directly triggers drop-offs", color: "from-indigo-500 to-purple-500" },
    { name: "Session Frequency", importance: 8.4, signal: "Consistent weekly logins buffer against churn", color: "from-purple-500 to-pink-500" },
    { name: "Inactivity Recency", importance: 3.5, signal: "Inactivity >7 days is the top leading churn alert", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <TopHeader
        title="AI Recommendations & Retention Drivers"
        subtitle="Machine learning feature attribution and real-time subscriber risk simulation."
        searchPlaceholder="Search models, features..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Ranked Retention Drivers (Random Forest)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Relative feature importance derived from 5,000 subscriber behavior histories.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                83.5% Precision
              </span>
            </div>

            <div className="space-y-4">
              {driversList.map((driver) => (
                <div key={driver.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{driver.name}</span>
                    <span className="font-bold text-cyan-400">{driver.importance}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#141b2d] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${driver.color}`}
                      style={{ width: `${driver.importance * 2}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400">{driver.signal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#080c14] border border-[#162035]">
              <span className="text-[10px] uppercase font-bold text-slate-500">Model Accuracy</span>
              <p className="text-2xl font-black text-white mt-1">83.6%</p>
              <span className="text-[10px] text-emerald-400">1,000 Test Cohorts</span>
            </div>

            <div className="p-4 rounded-xl bg-[#080c14] border border-[#162035]">
              <span className="text-[10px] uppercase font-bold text-slate-500">Churn Precision</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">83.5%</p>
              <span className="text-[10px] text-slate-400">PRD Benchmark &gt;= 80%</span>
            </div>

            <div className="p-4 rounded-xl bg-[#080c14] border border-[#162035]">
              <span className="text-[10px] uppercase font-bold text-slate-500">F1 Score</span>
              <p className="text-2xl font-black text-purple-400 mt-1">82.2%</p>
              <span className="text-[10px] text-slate-400">Harmonic Mean</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1220] border border-[#162035] space-y-6">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Live Churn Risk Simulator</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust subscriber engagement telemetry to simulate risk predictions.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Avg Completion Rate</span>
                <span className="font-bold text-white">{completionRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={completionRate}
                onChange={(e) => setCompletionRate(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-[#141b2d] rounded-lg h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Avg Watch Duration</span>
                <span className="font-bold text-white">{watchDuration}m</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={watchDuration}
                onChange={(e) => setWatchDuration(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-[#141b2d] rounded-lg h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Days Inactive</span>
                <span className="font-bold text-white">{daysInactive}d</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={daysInactive}
                onChange={(e) => setDaysInactive(Number(e.target.value))}
                className="w-full accent-purple-400 bg-[#141b2d] rounded-lg h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Pause Rate (pauses/min)</span>
                <span className="font-bold text-white">{pauseRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={Math.round(pauseRate * 100)}
                onChange={(e) => setPauseRate(Number(e.target.value) / 100)}
                className="w-full accent-rose-400 bg-[#141b2d] rounded-lg h-1.5"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#080c14] border border-[#162035] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Predicted Churn Risk
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  riskTier === "low"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : riskTier === "medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {riskTier} Risk
              </span>
            </div>

            <div className="text-3xl font-black text-white">
              {(riskScore * 100).toFixed(1)}%
            </div>

            <p className="text-[11px] text-slate-400 pt-1 border-t border-[#141b2d]">
              {riskTier === "low"
                ? "Healthy viewer engagement. Prime candidate for loyalty promotions."
                : riskTier === "medium"
                ? "Moderate engagement decay. Trigger personalized watchlist notifications."
                : "Critical churn hazard. Recommend immediate discount or content reactivation email."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
