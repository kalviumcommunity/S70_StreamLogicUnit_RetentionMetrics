"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Film,
  Activity,
} from "lucide-react";

export const NavSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Engagement", href: "/engagement", icon: BarChart3 },
    { label: "Retention Drivers", href: "/retention", icon: TrendingUp },
    { label: "Content Insights", href: "/content", icon: Film },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col p-4">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background font-black shadow-md shadow-primary/20">
          <Activity className="w-5 h-5 text-background" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-text-primary">
            StreamPulse
          </h1>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">
            Retention Analytics
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-muted"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Persona Context Badge */}
      <div className="bg-surface-elevated/60 border border-border rounded-lg p-3 text-xs">
        <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">
          Active Workspace
        </p>
        <p className="text-text-primary font-medium">Growth & Retention Unit</p>
        <p className="text-text-muted text-[11px] mt-0.5">Live ML Inference v1.0</p>
      </div>
    </aside>
  );
};
