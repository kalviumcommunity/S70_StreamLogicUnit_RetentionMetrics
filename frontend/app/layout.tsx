import "./globals.css";
import React from "react";
import { NavSidebar } from "@/components/NavSidebar";

export const metadata = {
  title: "RetentionIQ — OTT Performance & Viewer Behavior Intelligence",
  description:
    "Evidence-based analytics platform connecting subscriber viewing behavior to retention.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0c101d] text-white min-h-screen flex antialiased">
        <NavSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
