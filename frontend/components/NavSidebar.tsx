"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Tv,
  Users,
  Sparkles,
  Settings,
  LogOut,
  Hexagon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const NavSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Do not render sidebar on authentication pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isAuthPage) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/", icon: BarChart2 },
    { label: "Content Insights", href: "/content", icon: Tv },
    { label: "Viewer Behavior", href: "/behavior", icon: Users },
    { label: "AI Recommendations", href: "/retention", icon: Sparkles },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const displayName = user?.full_name || "Elena Rostova";
  const displayRole = user?.role || "Lead Architect";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-[#151c2e] min-h-screen flex flex-col justify-between p-4 flex-shrink-0 select-none">
      <div>
        {/* STREAM PULSE Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 px-3 py-3 mb-6 block group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform p-[2px]">
            <div className="w-full h-full rounded-[10px] bg-[#0c1220]/80 flex items-center justify-center">
              <Hexagon className="w-4 h-4 text-white stroke-[2.2]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white uppercase group-hover:text-cyan-300 transition-colors">
              STREAM PULSE
            </span>
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest -mt-0.5">
              RETENTION INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  (item.href === "/behavior" && pathname === "/engagement");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#141b2d] text-white border border-[#202c48] shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0f1422]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-cyan-400" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Authenticated User Profile Card with Live Dropdown */}
      <div ref={menuRef} className="relative">
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2.5 rounded-xl bg-[#0c1220] border border-[#162035] flex items-center space-x-3 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1.5px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#0c1220] flex items-center justify-center text-cyan-300 font-bold text-xs">
              {initials}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {displayRole}
            </p>
          </div>
          <ChevronRight
            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
              menuOpen ? "rotate-90 text-cyan-400" : ""
            }`}
          />
        </div>

        {/* User Actions Dropdown */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 p-2 rounded-xl bg-[#0f1524] border border-[#182238] shadow-2xl space-y-1 text-xs z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-2.5 py-1.5 border-b border-[#182238] mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Signed In As
              </span>
              <span className="text-xs font-semibold text-white truncate block">
                {user?.email || "demo@streampulse.io"}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                Active Session
              </span>
            </div>

            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#151d30] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Workspace Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
