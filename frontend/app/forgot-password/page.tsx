"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { AuthLayout, StreamPulseLogo } from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setSubmitted(true);
      if (data.reset_url) {
        setResetUrl(data.reset_url);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[#0f1524]/90 backdrop-blur-md border border-[#182238] rounded-3xl p-7 sm:p-8 shadow-2xl shadow-purple-950/20 text-center">
        <StreamPulseLogo />

        {/* Shield Check Badge */}
        <div className="mx-auto w-12 h-12 rounded-full bg-purple-950/40 border border-purple-600/50 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/10">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
        </div>

        <h2 className="text-base font-bold text-white">Reset Your Password</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Enter your email and we will send you a secure link to reset your password.
        </p>

        {submitted ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs font-medium space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="text-[11px] text-slate-300">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive instructions shortly.
              </p>
            </div>

            {resetUrl && (
              <div className="p-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                  Demo Showcase Direct Link:
                </span>
                <Link
                  href={resetUrl}
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] break-all underline"
                >
                  Click here to simulate opening your reset link
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#06b6d4] hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-[#151c2e] text-[10px] text-slate-500 tracking-widest uppercase font-mono">
          SECURE LINK VALID FOR 24 HOURS
        </div>
      </div>
    </AuthLayout>
  );
}
