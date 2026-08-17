import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = "No data available for the selected filters",
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-text-secondary animate-pulse">Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-risk-high/10 text-risk-high flex items-center justify-center mb-2">
              !
            </div>
            <p className="text-sm font-medium text-risk-high">Failed to load chart</p>
            <p className="text-xs text-text-muted mt-1 max-w-sm">{error}</p>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-text-secondary">{emptyMessage}</p>
            <p className="text-xs text-text-muted mt-1">Try adjusting your date range or genre filter.</p>
          </div>
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </div>
  );
};
