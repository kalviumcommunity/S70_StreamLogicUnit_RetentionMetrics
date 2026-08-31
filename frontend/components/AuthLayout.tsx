"use client";

import React from "react";
import { Hexagon, Globe, KeyRound } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#080c16] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Geometric Constellation / Mesh Lines (as seen in screenshots) */}
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

      <h1 className="text-xl font-bold tracking-tight text-white">
        Stream Pulse
      </h1>
      <p className="text-[11px] font-medium text-cyan-400 mt-0.5 tracking-wide">
        {subtitle}
      </p>
    </div>
  );
};

export const SSOButtons: React.FC<{ label?: string }> = ({ label = "OR CONTINUE WITH" }) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#182238] w-full" />
        <span className="bg-[#0f1524] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider absolute">
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>Google</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>Microsoft</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0c1220] border border-[#1a253c] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>SSO</span>
        </button>
      </div>
    </div>
  );
};
