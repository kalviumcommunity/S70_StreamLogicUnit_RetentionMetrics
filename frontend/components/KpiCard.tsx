import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  riskVariant?: "low" | "medium" | "high";
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  riskVariant,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-surface-elevated rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-surface-elevated rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-surface-elevated rounded w-1/3"></div>
      </div>
    );
  }

  let valueColor = "text-text-primary";
  if (riskVariant === "low") valueColor = "text-risk-low";
  if (riskVariant === "medium") valueColor = "text-risk-medium";
  if (riskVariant === "high") valueColor = "text-risk-high";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-border/80 transition-all shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-1">
        {title}
      </p>
      <div className="flex items-baseline justify-between">
        <h3 className={`text-2xl font-bold tracking-tight ${valueColor}`}>
          {value}
        </h3>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-risk-low/10 text-risk-low"
                : "bg-risk-high/10 text-risk-high"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-text-muted mt-2">{subtitle}</p>
      )}
    </div>
  );
};
