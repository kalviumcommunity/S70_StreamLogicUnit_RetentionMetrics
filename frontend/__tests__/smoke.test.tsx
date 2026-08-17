import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock api client
vi.mock("@/lib/api", () => ({
  api: {
    getEngagementSummary: vi.fn().mockResolvedValue([
      { genre: "Action", avg_completion_rate: 80.0, avg_watch_duration: 45.0, session_count: 1000 },
      { genre: "Drama", avg_completion_rate: 85.0, avg_watch_duration: 55.0, session_count: 1200 },
    ]),
    getRetentionDrivers: vi.fn().mockResolvedValue([
      { feature: "days_since_last_session", importance: 0.35, interpretation: "High impact driver" },
      { feature: "avg_completion_rate", importance: 0.28, interpretation: "Completion is key" },
    ]),
    getContentInsights: vi.fn().mockResolvedValue([
      { content_id: "CNT_001", title: "Quantum Nexus", genre: "Sci-Fi", avg_completion_rate: 92.0, total_sessions: 3000 },
    ]),
    predictRisk: vi.fn().mockResolvedValue({
      risk_score: 0.25,
      risk_label: "low",
    }),
  },
}));

// Mock Recharts to render cleanly in jsdom
vi.mock("recharts", () => {
  const MockComponent = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-chart">{children}</div>
  );
  return {
    ResponsiveContainer: MockComponent,
    AreaChart: MockComponent,
    Area: MockComponent,
    BarChart: MockComponent,
    Bar: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    Tooltip: MockComponent,
    CartesianGrid: MockComponent,
    Cell: MockComponent,
  };
});

import OverviewPage from "../app/page";
import EngagementPage from "../app/engagement/page";
import RetentionPage from "../app/retention/page";
import ContentInsightsPage from "../app/content/page";
import { KpiCard } from "../components/KpiCard";
import { FilterBar } from "../components/FilterBar";
import { NavSidebar } from "../components/NavSidebar";

describe("Frontend Dashboard Smoke Tests", () => {
  it("renders KpiCard component without crashing", () => {
    render(<KpiCard title="Test KPI" value="1,234" change="+5%" isPositive={true} />);
    expect(screen.getByText("Test KPI")).toBeDefined();
    expect(screen.getByText("1,234")).toBeDefined();
  });

  it("renders FilterBar component without crashing", () => {
    render(<FilterBar selectedGenre="All" onGenreChange={() => {}} />);
    expect(screen.getByText("Genre:")).toBeDefined();
  });

  it("renders NavSidebar component without crashing", () => {
    render(<NavSidebar />);
    expect(screen.getByText("StreamPulse")).toBeDefined();
    expect(screen.getByText("Overview")).toBeDefined();
  });

  it("renders Overview Screen (app/page.tsx)", () => {
    const { container } = render(<OverviewPage />);
    expect(container).toBeDefined();
    expect(screen.getByText(/Executive Retention/i)).toBeDefined();
  });

  it("renders Engagement Screen (app/engagement/page.tsx)", () => {
    const { container } = render(<EngagementPage />);
    expect(container).toBeDefined();
    expect(screen.getByText(/Engagement Deep-Dive/i)).toBeDefined();
  });

  it("renders Retention Drivers Screen (app/retention/page.tsx)", () => {
    const { container } = render(<RetentionPage />);
    expect(container).toBeDefined();
    expect(screen.getByText(/Retention Drivers/i)).toBeDefined();
  });

  it("renders Content Insights Screen (app/content/page.tsx)", () => {
    const { container } = render(<ContentInsightsPage />);
    expect(container).toBeDefined();
    expect(screen.getByText(/Content & Genre Acquisition Insights/i)).toBeDefined();
  });
});
