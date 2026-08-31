"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  organization?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  ssoLogin: (payload: {
    provider: "google" | "microsoft" | "sso";
    email: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    organization?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const stored = localStorage.getItem("streampulse_user");
      const token = localStorage.getItem("streampulse_token");

      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("streampulse_user", JSON.stringify(data));
        } else if (res.status === 401) {
          localStorage.removeItem("streampulse_token");
          localStorage.removeItem("streampulse_user");
          setUser(null);
        }
      }
    } catch {
      // Offline / fallback to stored state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Invalid email or password." };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("streampulse_user", JSON.stringify(data.user));
      }
      if (data.access_token) {
        localStorage.setItem("streampulse_token", data.access_token);
      }

      return { success: true };
    } catch {
      return { success: false, error: "Unable to connect to StreamPulse API. Please check server." };
    }
  };

  const ssoLogin = async (payload: {
    provider: "google" | "microsoft" | "sso";
    email: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    organization?: string;
  }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/sso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "SSO authentication failed." };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("streampulse_user", JSON.stringify(data.user));
      }
      if (data.access_token) {
        localStorage.setItem("streampulse_token", data.access_token);
      }

      return { success: true };
    } catch {
      return { success: false, error: "Unable to connect to StreamPulse API." };
    }
  };

  const signup = async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Registration failed. Please verify fields." };
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("streampulse_user", JSON.stringify(data.user));
      }
      if (data.access_token) {
        localStorage.setItem("streampulse_token", data.access_token);
      }

      return { success: true };
    } catch {
      return { success: false, error: "Unable to connect to StreamPulse API. Please check server." };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/logout`, { method: "POST" });
    } catch {
      // Ignore
    }
    localStorage.removeItem("streampulse_token");
    localStorage.removeItem("streampulse_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, ssoLogin, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
