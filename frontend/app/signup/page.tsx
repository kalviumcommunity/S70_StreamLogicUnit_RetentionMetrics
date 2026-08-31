"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout, StreamPulseLogo, SSOButtons } from "@/components/AuthLayout";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate password strength score (0 to 4)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (!password) return "Password strength";
    if (strengthScore <= 1) return "Weak";
    if (strengthScore <= 3) return "Medium";
    return "Strong Password";
  }, [password, strengthScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please provide your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
          role: "Analytics",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Registration failed. Please verify your inputs.");
        setLoading(false);
        return;
      }

      // Navigate to Login page with registered notification & prefilled email
      router.push(`/login?registered=true&email=${encodeURIComponent(email.trim())}`);
    } catch {
      setErrorMsg("Unable to connect to StreamPulse API. Please ensure the backend is running.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[#0f1524]/90 backdrop-blur-md border border-[#182238] rounded-3xl p-7 sm:p-8 shadow-2xl shadow-purple-950/20">
        <StreamPulseLogo />

        <div className="text-center mb-5">
          <h2 className="text-base font-bold text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Get access to real-time retention and viewer analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* First Name & Last Name in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
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

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
                placeholder="Re-enter password"
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

          {/* 4-Segment Password Strength Indicator */}
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

          {/* Terms & Conditions Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 rounded bg-[#0c1220] border-[#1a253c] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="leading-tight">
                I agree to the{" "}
                <span className="text-cyan-400 hover:underline">Terms of Service</span> and{" "}
                <span className="text-cyan-400 hover:underline">Privacy Policy</span>
              </span>
            </label>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#06b6d4] hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* SSO Buttons */}
        <SSOButtons label="OR SIGN UP WITH" />

        {/* Footer Link */}
        <div className="mt-5 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
