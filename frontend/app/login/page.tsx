"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout, StreamPulseLogo, SSOButtons } from "@/components/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password, rememberMe);
    setLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMsg(result.error || "Invalid email or password.");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[#0f1524]/90 backdrop-blur-md border border-[#182238] rounded-3xl p-7 sm:p-8 shadow-2xl shadow-purple-950/20">
        <StreamPulseLogo />

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Email Address */}
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
                className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#0c1220] border border-[#1a253c] text-slate-100 text-xs rounded-xl pl-10 pr-10 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
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

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#0c1220] border-[#1a253c] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#06b6d4] hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* SSO Buttons */}
        <SSOButtons label="OR CONTINUE WITH" />

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don&apos;t have an account? </span>
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Request Access
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
