/**
 * Typed API client for StreamPulse FastAPI backend.
 */

export interface EngagementSummary {
  genre: string;
  avg_completion_rate: number;
  avg_watch_duration: number;
  session_count: number;
}

export interface RetentionDriver {
  feature: string;
  importance: number;
  interpretation: string;
}

export interface ContentInsight {
  content_id: string;
  title: string;
  genre: string;
  avg_completion_rate: number;
  total_sessions: number;
}

export interface PredictRequest {
  avg_completion_rate: number;
  avg_watch_duration: number;
  session_count: number;
  days_since_last_session: number;
  binge_score: number;
  pause_rate: number;
}

export interface PredictResponse {
  risk_score: number;
  risk_label: "low" | "medium" | "high";
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getEngagementSummary: async (genre?: string, startDate?: string, endDate?: string): Promise<EngagementSummary[]> => {
    const params = new URLSearchParams();
    if (genre && genre !== "All") params.append("genre", genre);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return fetchJson<EngagementSummary[]>(`/api/engagement-summary${queryString}`);
  },

  getRetentionDrivers: async (): Promise<RetentionDriver[]> => {
    return fetchJson<RetentionDriver[]>("/api/retention-drivers");
  },

  getContentInsights: async (limit: number = 10): Promise<ContentInsight[]> => {
    return fetchJson<ContentInsight[]>(`/api/content-insights?limit=${limit}`);
  },

  predictRisk: async (data: PredictRequest): Promise<PredictResponse> => {
    return fetchJson<PredictResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getHealth: async (): Promise<{ status: string }> => {
    return fetchJson<{ status: string }>("/api/health");
  },
};
