import "./globals.css";
import React from "react";
import { NavSidebar } from "@/components/NavSidebar";

export const metadata = {
  title: "StreamPulse — Viewer Engagement & Retention Analytics",
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
      <body className="bg-background text-text-primary min-h-screen flex antialiased">
        <NavSidebar />
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
