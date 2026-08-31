import "./globals.css";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "Stream Pulse — AI-Powered Streaming Intelligence & Retention",
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
      <body className="bg-[#0c101d] text-white min-h-screen antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
