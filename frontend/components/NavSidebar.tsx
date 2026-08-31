"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Tv,
  Users,
  Sparkles,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const NavSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Do not render sidebar on authentication pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

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
        {/* RetentionIQ Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 px-3 py-3 mb-6 block">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-4 h-4 rounded border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            RetentionIQ
          </span>
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

      {/* Authenticated User Profile Card at Bottom with Logout */}
      <div className="relative">
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

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 p-1.5 rounded-xl bg-[#0f1524] border border-[#182238] shadow-xl space-y-1 text-xs z-50">
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
