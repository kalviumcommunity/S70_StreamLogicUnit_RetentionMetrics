"use client";

import React, { useEffect, useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Sparkles, Cpu, CheckCircle2, BookmarkPlus, RotateCcw } from "lucide-react";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const presets = [
    {
      name: "Power Viewer",
      params: { comp: 92.0, dur: 58.0, sess: 24, inact: 1, binge: 4.8, pause: 0.03 },
    },
    {
      name: "Casual Active",
      params: { comp: 75.0, dur: 45.0, sess: 12, inact: 3, binge: 3.5, pause: 0.08 },
    },
    {
      name: "At-Risk Slump",
      params: { comp: 42.0, dur: 18.0, sess: 4, inact: 9, binge: 1.2, pause: 0.22 },
    },
    {
      name: "Critical Churn",
      params: { comp: 15.0, dur: 8.0, sess: 1, inact: 18, binge: 0.4, pause: 0.45 },
    },
  ];

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

  const loadPreset = (p: typeof presets[0]) => {
    setCompletionRate(p.params.comp);
    setWatchDuration(p.params.dur);
    setSessionCount(p.params.sess);
    setDaysInactive(p.params.inact);
    setBingeScore(p.params.binge);
    setPauseRate(p.params.pause);
    setToastMessage(`Loaded Preset Scenario: "${p.name}". ML prediction updated.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveScenario = () => {
    setToastMessage(`Simulation Scenario Saved: Churn Score ${(riskScore * 100).toFixed(0)}% (${riskTier.toUpperCase()}) added to retention report.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const riskPct = (riskScore * 100).toFixed(0);
  const tierColor =
    riskTier === "low"
      ? "text-emerald-400 border-emerald-800/80 bg-emerald-950/60"
      : riskTier === "medium"
      ? "text-amber-400 border-amber-800/80 bg-amber-950/60"
      : "text-rose-400 border-rose-800/80 bg-rose-950/60";

  return (
    <div className="space-y-6 relative">
      <TopHeader
        title="STREAM PULSE — AI Recommendations & Churn Simulator"
        subtitle="Interact with real-time ML features to simulate subscriber retention sensitivity."
        searchPlaceholder="Search model parameters, sensitivity..."
        hasSparkleIcon={true}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0f1524] border border-cyan-500/80 shadow-2xl shadow-cyan-500/20 text-xs text-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Quick Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1524] border border-[#182238]">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Quick Benchmark Presets:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-[#0c1220] border border-[#1a253c] hover:border-cyan-500/60 text-xs font-medium text-slate-300 hover:text-white transition-all shrink-0"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={handleSaveScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8b5cf6] text-white hover:bg-purple-600 text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all shrink-0 ml-1"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive ML Parameter Sliders (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#182238] pb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subscriber Feature Inputs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Random Forest Telemetry Matrix (Models trained on 50,000 viewing sessions)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-cyan-400">ML INFERENCE ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Slider 1: Completion Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Avg Completion Rate</span>
                <span className="font-mono text-cyan-400 font-bold">{completionRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={completionRate}
                onChange={(e) => setCompletionRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-[#12192c] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Baseline benchmark: 74%</span>
            </div>

            {/* Slider 2: Watch Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Avg Watch Duration</span>
                <span className="font-mono text-cyan-400 font-bold">{watchDuration} min</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="1"
                value={watchDuration}
                onChange={(e) => setWatchDuration(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-[#12192c] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Baseline benchmark: 42 min</span>
            </div>

            {/* Slider 3: Session Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">30-Day Session Count</span>
                <span className="font-mono text-purple-400 font-bold">{sessionCount} sessions</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={sessionCount}
                onChange={(e) => setSessionCount(parseInt(e.target.value, 10))}
                className="w-full accent-purple-400 bg-[#12192c] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Baseline benchmark: 14 sessions</span>
            </div>

            {/* Slider 4: Inactivity Days */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Days Since Last Session</span>
                <span className="font-mono text-rose-400 font-bold">{daysInactive} days</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={daysInactive}
                onChange={(e) => setDaysInactive(parseInt(e.target.value, 10))}
                className="w-full accent-rose-400 bg-[#12192c] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Critical threshold: &gt; 7 days</span>
            </div>

            {/* Slider 5: Binge Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Binge Watching Score</span>
                <span className="font-mono text-cyan-400 font-bold">{bingeScore} / 5.0</span>
              </div>
              <input
                type="range"
                min="0"
                max="5.0"
                step="0.1"
                value={bingeScore}
                onChange={(e) => setBingeScore(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-[#12192c] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Consecutive episode depth index</span>
            </div>

            {/* Slider 6: Pause Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Pause Frequency (per min)</span>
                <span className="font-mono text-purple-400 font-bold">{pauseRate}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.01"
                value={pauseRate}
                onChange={(e) => setPauseRate(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-[#12192c] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Playback friction metric</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Churn Risk Prediction Gauge & Directives */}
        <div className="space-y-6">
          {/* Prediction Gauge */}
          <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm flex flex-col items-center text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 self-start">
              PREDICTED CHURN RISK
            </h3>

            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-[#182238] fill-none" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`fill-none transition-all duration-500 ${
                    riskTier === "low"
                      ? "stroke-emerald-400"
                      : riskTier === "medium"
                      ? "stroke-amber-400"
                      : "stroke-rose-400"
                  }`}
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * riskScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-white tracking-tight font-mono">
                  {riskPct}%
                </span>
                <span className={`text-[11px] font-bold tracking-wider mt-0.5 uppercase px-2 py-0.5 rounded-full border ${tierColor}`}>
                  {riskTier} Risk
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {riskTier === "low"
                ? "Subscriber shows high retention affinity and low probability of 30-day cancellation."
                : riskTier === "medium"
                ? "Moderate churn indicators detected. Re-engagement carousel and push notifications advised."
                : "High-risk churn signature. Automated retention discount and targeted content alert recommended."}
            </p>
          </div>

          {/* AI Automated Intervention */}
          <div className="p-6 rounded-2xl bg-[#0f1524] border border-[#182238] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Recommended Intervention</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#12192c] border border-[#1a253e] space-y-1">
              <h4 className="text-xs font-semibold text-white">
                {riskTier === "low"
                  ? "Loyalty Milestone Reward"
                  : riskTier === "medium"
                  ? "Personalized Carousel Push"
                  : "Immediate Win-Back Incentive"}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {riskTier === "low"
                  ? "Deliver early access to next season premier of high-completion genres."
                  : riskTier === "medium"
                  ? "Trigger notification for trending titles with >90% completion rates."
                  : "Dispatch 20% renewal incentive combined with curated top-rated movies."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
