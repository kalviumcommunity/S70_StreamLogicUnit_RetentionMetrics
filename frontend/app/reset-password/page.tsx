"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthLayout, StreamPulseLogo } from "@/components/AuthLayout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  }, [newPassword]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return "Password strength";
    if (strengthScore <= 1) return "Weak";
    if (strengthScore <= 3) return "Medium";
    return "Strong Password";
  }, [newPassword, strengthScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg("Missing or invalid reset token. Please request a new reset link.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(data.detail || "Password reset failed. Link may have expired.");
      }
    } catch {
      setErrorMsg("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f1524]/90 backdrop-blur-md border border-[#182238] rounded-3xl p-7 sm:p-8 shadow-2xl shadow-purple-950/20">
      <StreamPulseLogo />

      {success ? (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-600/50 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>

          <h2 className="text-base font-bold text-white">Password Updated Successfully</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You can now sign in with your new credentials.
          </p>

          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#06b6d4] hover:opacity-95 shadow-lg shadow-cyan-500/20 block text-center mt-4 transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center mb-5">
            <h2 className="text-base font-bold text-white">Create a New Password</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter and confirm your new secure password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl pl-10 pr-10 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl pl-10 pr-10 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength bar */}
            <div className="space-y-1 pt-0.5">
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((seg) => {
                  const filled = strengthScore >= seg;
                  const segColor =
                    strengthScore <= 1
                      ? "bg-rose-500"
                      : strengthScore <= 3
                      ? "bg-amber-400"
                      : "bg-emerald-400";
                  return (
                    <div
                      key={seg}
                      className={`rounded-full transition-all duration-300 ${
                        filled ? segColor : "bg-[#182238]"
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className={strengthScore >= 4 ? "text-emerald-400 font-medium" : ""}>
                  {strengthLabel}
                </span>
                <span>At least 8 chars</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#06b6d4] hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel &amp; Sign In</span>
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
