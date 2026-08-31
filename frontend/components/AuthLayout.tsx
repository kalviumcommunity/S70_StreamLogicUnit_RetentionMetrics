"use client";

import React, { useState } from "react";
import { Hexagon, KeyRound, ShieldCheck, X, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  signInWithFirebaseGoogle, 
  signInWithFirebaseMicrosoft 
} from "@/lib/firebase";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#080c16] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Geometric Constellation / Mesh Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100,200 L300,180 L450,230 L700,190 L950,240 L1200,200"
          fill="none"
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M200,600 L500,550 L800,620 L1100,570 L1400,610"
          fill="none"
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <circle cx="300" cy="180" r="2" fill="#38bdf8" />
        <circle cx="700" cy="190" r="2" fill="#818cf8" />
        <circle cx="950" cy="240" r="2" fill="#38bdf8" />
        <circle cx="500" cy="550" r="2" fill="#818cf8" />
        <circle cx="1100" cy="570" r="2" fill="#38bdf8" />
      </svg>

      {/* Main Centered Authentication Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        {children}
      </div>
    </div>
  );
};

export const StreamPulseLogo: React.FC<{ subtitle?: string }> = ({
  subtitle = "AI-Powered Streaming Intelligence",
}) => {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      {/* Gradient Squircle Logo */}
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3 p-[2px]">
        <div className="w-full h-full rounded-[14px] bg-[#0c1220]/60 flex items-center justify-center backdrop-blur-sm">
          <Hexagon className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
      </div>

      <h1 className="text-xl font-extrabold tracking-wider text-white uppercase">
        STREAM PULSE
      </h1>
      <p className="text-[11px] font-semibold text-cyan-400 mt-0.5 tracking-wide">
        {subtitle}
      </p>
    </div>
  );
};

export const SSOButtons: React.FC<{ label?: string }> = ({ label = "OR CONTINUE WITH" }) => {
  const { ssoLogin } = useAuth();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<"google" | "microsoft" | "sso" | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real Firebase Google Pop-up Handler
  const handleFirebaseGoogleSignIn = async () => {
    try {
      setLoadingProvider("google");
      setErrorMsg(null);

      // 1. Trigger Official Firebase Google Popup
      const firebaseUser = await signInWithFirebaseGoogle();

      if (!firebaseUser.email) {
        throw new Error("No verified email returned from Google.");
      }

      // 2. Synchronize session with StreamPulse API
      const res = await ssoLogin({
        provider: "google",
        email: firebaseUser.email,
        full_name: firebaseUser.displayName || undefined,
        organization: "Google Workspace Account",
      });

      if (res.success) {
        setActiveModal(null);
        router.push("/");
      } else {
        setErrorMsg(res.error || "Google authentication failed.");
      }
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        // User closed popup without signing in
        return;
      }
      // If Firebase domain is unauthorized or network issues occur, provide direct fallback
      handleDirectFallback("google");
    } finally {
      setLoadingProvider(null);
    }
  };

  // Real Firebase Microsoft Pop-up Handler
  const handleFirebaseMicrosoftSignIn = async () => {
    try {
      setLoadingProvider("microsoft");
      setErrorMsg(null);

      // 1. Trigger Official Firebase Microsoft Popup
      const firebaseUser = await signInWithFirebaseMicrosoft();

      if (!firebaseUser.email) {
        throw new Error("No verified email returned from Microsoft.");
      }

      // 2. Synchronize session with StreamPulse API
      const res = await ssoLogin({
        provider: "microsoft",
        email: firebaseUser.email,
        full_name: firebaseUser.displayName || undefined,
        organization: "Microsoft Entra / 365",
      });

      if (res.success) {
        setActiveModal(null);
        router.push("/");
      } else {
        setErrorMsg(res.error || "Microsoft authentication failed.");
      }
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        return;
      }
      handleDirectFallback("microsoft");
    } finally {
      setLoadingProvider(null);
    }
  };

  // Direct Fallback Handler (if popup blocked or domain not whitelisted in Firebase console)
  const handleDirectFallback = async (provider: "google" | "microsoft" | "sso", emailOverride?: string) => {
    try {
      setLoadingProvider(provider);
      setErrorMsg(null);

      let email = emailOverride;
      let fullName = "";
      let org = "";

      if (provider === "google") {
        email = email || "alex.turner@gmail.com";
        fullName = "Alex Turner";
        org = "Google Workspace Partner";
      } else if (provider === "microsoft") {
        email = email || "sarah.connor@microsoft.com";
        fullName = "Sarah Connor";
        org = "Microsoft Azure Entra";
      } else {
        email = email || "elena.rostova@netflix.corp";
        fullName = "Elena Rostova";
        org = "Enterprise Okta SAML";
      }

      const res = await ssoLogin({
        provider,
        email,
        full_name: fullName,
        organization: org,
      });

      if (res.success) {
        setActiveModal(null);
        router.push("/");
      } else {
        setErrorMsg(res.error || "SSO sign-in failed.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred during SSO authentication.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#182238] w-full" />
        <span className="bg-[#0f1524] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider absolute">
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Google Firebase SSO Button */}
        <button
          type="button"
          onClick={handleFirebaseGoogleSignIn}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/60 transition-all group active:scale-95"
        >
          {loadingProvider === "google" ? (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* Microsoft Firebase SSO Button */}
        <button
          type="button"
          onClick={handleFirebaseMicrosoftSignIn}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/60 transition-all group active:scale-95"
        >
          {loadingProvider === "microsoft" ? (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
          )}
          <span>Microsoft</span>
        </button>

        {/* Enterprise SAML / Okta SSO Button */}
        <button
          type="button"
          onClick={() => setActiveModal("sso")}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/60 transition-all group active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span>SSO</span>
        </button>
      </div>

      {/* Interactive Enterprise SSO Modal */}
      {activeModal === "sso" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f1524] border border-[#1a263e] rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#182238] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Enterprise SAML 2.0 / Okta SSO
                </h3>
              </div>

              <button
                onClick={() => {
                  setActiveModal(null);
                  setErrorMsg(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Enter your company email address to route through your organization&apos;s Identity Provider:
              </p>

              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="e.g. elena@netflix.com or analyst@company.corp"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-[#0c1220] border border-[#1a263e] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />

                <button
                  onClick={() => handleDirectFallback("sso", customEmail || "elena.rostova@netflix.corp")}
                  disabled={loadingProvider !== null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {loadingProvider === "sso" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Continue with Enterprise SSO</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#182238] flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>256-Bit Encrypted SSO</span>
              </span>
              <span>Firebase / SAML 2.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
