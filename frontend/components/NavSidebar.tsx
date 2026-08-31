"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Tv,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";

export const NavSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: BarChart2 },
    { label: "Content Insights", href: "/content", icon: Tv },
    { label: "Viewer Behavior", href: "/behavior", icon: Users },
    { label: "AI Recommendations", href: "/retention", icon: Sparkles },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-[#151c2e] min-h-screen flex flex-col justify-between p-4 flex-shrink-0 select-none">
      <div>
        {/* RetentionIQ Brand Logo */}
        <div className="flex items-center space-x-3 px-3 py-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-4 h-4 rounded border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            RetentionIQ
          </span>
        </div>

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

      {/* Elena Rostova User Profile Card at Bottom */}
      <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#162035] flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1.5px] flex-shrink-0">
          <div className="w-full h-full rounded-full bg-[#0c1220] flex items-center justify-center text-cyan-300 font-bold text-xs">
            ER
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">
            Elena Rostova
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            Lead Architect
          </p>
        </div>
      </div>
    </aside>
  );
};
