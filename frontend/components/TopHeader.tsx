"use client";

import React from "react";
import { Search, Bell, User, Sparkles } from "lucide-react";

interface TopHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  hasSparkleIcon?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  searchPlaceholder = "Search analytics, shows...",
  hasSparkleIcon = false,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#141c2e]">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          {hasSparkleIcon && <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400/20" />}
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full bg-[#0d1322] border border-[#1a243a] text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-xl bg-[#0d1322] border border-[#1a243a] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#080c14] animate-pulse"></span>
        </button>

        <button className="p-2 rounded-xl bg-[#0d1322] border border-[#1a243a] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
