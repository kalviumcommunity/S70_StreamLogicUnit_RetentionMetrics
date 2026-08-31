"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NavSidebar } from "@/components/NavSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAuthPage) {
    return (
      <ProtectedRoute>
        <div className="w-full min-h-screen bg-[#080c16] text-white">
          {children}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex w-full min-h-screen bg-[#0c101d] text-white">
        <NavSidebar />
        <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};
