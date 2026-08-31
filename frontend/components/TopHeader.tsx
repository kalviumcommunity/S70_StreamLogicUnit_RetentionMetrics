"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Sparkles,
  Check,
  Trash2,
  Settings,
  LogOut,
  TrendingUp,
  AlertTriangle,
  Database,
  Film,
  X,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  hasSparkleIcon?: boolean;
}

interface NotificationItem {
  id: string;
  category: "CHURN ANOMALY" | "CATALOG SYNC" | "BINGE SURGE" | "CONVERSION CATALYST";
  severity: "critical" | "success" | "info" | "warning";
  title: string;
  message: string;
  metric: string;
  time: string;
  actionLabel: string;
  actionPath: string;
  read: boolean;
}

const STRUCTURED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "CHURN ANOMALY",
    severity: "critical",
    title: "Cohort Inactivity Spike",
    message: "42 subscribers in Tier-2 cohort exceeded 7 days inactivity. Predicted 30-day churn risk jumped to 38.4%.",
    metric: "38.4% Risk",
    time: "4m ago",
    actionLabel: "Simulate Mitigation",
    actionPath: "/retention",
    read: false,
  },
  {
    id: "notif-2",
    category: "CATALOG SYNC",
    severity: "success",
    title: "Kaggle OTT Catalog Ingested",
    message: "9,515 verified movie titles indexed with Rotten Tomatoes critic scores across Netflix, Prime Video, Hulu, Disney+.",
    metric: "9,515 Titles",
    time: "32m ago",
    actionLabel: "View Catalog",
    actionPath: "/content",
    read: false,
  },
  {
    id: "notif-3",
    category: "BINGE SURGE",
    severity: "info",
    title: "Weekend Streaming Peak",
    message: "Saturday 9:00 PM evening surge reached 19,450 concurrent streams with a 92% average completion rate.",
    metric: "19.5K Streams",
    time: "2h ago",
    actionLabel: "Inspect Heatmap",
    actionPath: "/",
    read: false,
  },
  {
    id: "notif-4",
    category: "CONVERSION CATALYST",
    severity: "warning",
    title: "50% Watch Milestone Met",
    message: "Subscribers surpassing 50% runtime milestone show an 88.4% full-season renewal probability.",
    metric: "88.4% Conv",
    time: "5h ago",
    actionLabel: "Review Funnel",
    actionPath: "/behavior",
    read: true,
  },
];

const SEARCH_CATALOG = [
  { title: "The Irishman", genre: "Drama", rating: "98/100", platform: "Netflix", path: "/content" },
  { title: "Dangal", genre: "Drama", rating: "97/100", platform: "Netflix", path: "/content" },
  { title: "David Attenborough: A Life on Our Planet", genre: "Documentary", rating: "95/100", platform: "Netflix", path: "/content" },
  { title: "Roma", genre: "Thriller", rating: "94/100", platform: "Netflix", path: "/content" },
  { title: "The Social Dilemma", genre: "Sci-Fi", rating: "93/100", platform: "Netflix", path: "/content" },
  { title: "Okja", genre: "Sci-Fi", rating: "92/100", platform: "Netflix", path: "/content" },
  { title: "The Trial of the Chicago 7", genre: "Drama", rating: "92/100", platform: "Netflix", path: "/content" },
  { title: "Viewer Journey Drop-off Funnel", genre: "Analytics", rating: "Cohort Node", platform: "Telemetry", path: "/behavior" },
  { title: "AI Churn Simulator & Sensitivity", genre: "ML Model", rating: "Predictive", platform: "Simulator", path: "/retention" },
  { title: "Workspace & API Key Settings", genre: "System", rating: "Configuration", platform: "Settings", path: "/settings" },
];

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  searchPlaceholder = "Search movies, analytics, telemetry...",
  hasSparkleIcon = false,
}) => {
  const { user, logout } = useAuth();

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(STRUCTURED_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredSearch = searchQuery.trim()
    ? SEARCH_CATALOG.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.platform.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const displayName = user?.full_name || "Elena Rostova";
  const displayEmail = user?.email || "demo@streampulse.io";
  const displayRole = user?.role || "Lead Architect";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#141c2e] relative z-30">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          {hasSparkleIcon && <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400/20" />}
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-Time Live Search */}
        <div ref={searchRef} className="relative w-64 md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder={searchPlaceholder}
            className="w-full bg-[#0d1322] border border-[#1a243a] text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-500/80 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Dropdown Results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 w-full mt-2 p-2 bg-[#0f1524] border border-[#1b263e] rounded-2xl shadow-2xl space-y-1 z-50 max-h-72 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider">
                Catalog &amp; Telemetry Results ({filteredSearch.length})
              </div>
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.path}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#151e33] transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.genre} · <span className="text-slate-500">{item.platform}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg shrink-0">
                      {item.rating}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching titles found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-Time Structured Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-xl bg-[#0d1322] border border-[#1a243a] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 text-[10px] font-bold text-black flex items-center justify-center ring-2 ring-[#080c14] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Structured Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-[420px] p-4 bg-[#0f1524] border border-[#1b263e] rounded-2xl shadow-2xl space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-[#182238] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    System Telemetry Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      title="Mark all as read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Structured Notification Items List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const badgeStyles = {
                      critical: "bg-rose-950/80 text-rose-300 border-rose-800/80",
                      success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
                      info: "bg-cyan-950/80 text-cyan-300 border-cyan-800/80",
                      warning: "bg-amber-950/80 text-amber-300 border-amber-800/80",
                    };

                    const iconStyles = {
                      critical: <AlertTriangle className="w-4 h-4 text-rose-400" />,
                      success: <Database className="w-4 h-4 text-emerald-400" />,
                      info: <TrendingUp className="w-4 h-4 text-cyan-400" />,
                      warning: <Film className="w-4 h-4 text-amber-400" />,
                    };

                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                          n.read
                            ? "bg-[#0c1220]/60 border-[#151c2e] text-slate-400 opacity-80"
                            : "bg-[#11182a] border-cyan-900/60 text-white shadow-md shadow-cyan-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {iconStyles[n.severity]}
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono tracking-wider ${
                                badgeStyles[n.severity]
                              }`}
                            >
                              {n.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                            {!n.read && (
                              <button
                                onClick={(e) => markSingleAsRead(n.id, e)}
                                title="Mark as read"
                                className="text-slate-500 hover:text-cyan-400"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => dismissNotification(n.id, e)}
                              title="Dismiss"
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-100 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="font-mono text-[11px] text-cyan-400 font-semibold">{n.metric}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <Link
                            href={n.actionPath}
                            onClick={() => setShowNotifications(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            <span>{n.actionLabel}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No active telemetry alerts. All subscriber cohorts operating within nominal thresholds.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#182238] text-center">
                <Link
                  href="/settings"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>Configure Telemetry Thresholds &amp; Webhooks</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Real-Time User Profile Trigger */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            aria-label="User Profile"
            className="p-1 rounded-xl bg-[#0d1322] border border-[#1a243a] hover:border-cyan-500/60 transition-colors flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-lg bg-[#0c1220] flex items-center justify-center text-cyan-300 font-bold text-xs">
                {initials}
              </div>
            </div>
          </button>

          {/* User Profile Dropdown Modal */}
          {showProfileModal && (
            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-[#0f1524] border border-[#1b263e] rounded-2xl shadow-2xl space-y-4 z-50">
              <div className="flex items-center gap-3 border-b border-[#182238] pb-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-[10px] bg-[#0c1220] flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {initials}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
                  <p className="text-[11px] text-slate-400 truncate font-mono">{displayEmail}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400">
                    {displayRole}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#0c1220] text-[11px]">
                  <span className="text-slate-400">Organization</span>
                  <span className="font-semibold text-white">{user?.organization || "StreamPulse Media"}</span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#0c1220] text-[11px]">
                  <span className="text-slate-400">Security Status</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>JWT Verified</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#182238] space-y-1.5">
                <Link
                  href="/settings"
                  onClick={() => setShowProfileModal(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#151d30] text-xs font-medium transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
