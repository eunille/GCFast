// features/payments/components/DashboardStatCard/DashboardStatCard.tsx
// Layer 4 — PRESENTATIONAL: Metric card with trend indicator (up/down/neutral)

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: number | null; // positive = up, negative = down, 0/null = neutral
  trendLabel?: string;   // e.g. "+12 this month"
  icon: ReactNode;
  iconBg: string;       // tailwind bg class
  iconColor: string;    // tailwind text class for icon
  valueColor?: string;  // tailwind text class for value
}

export function DashboardStatCard({ label, value, subLabel, trend, trendLabel, icon, iconBg, iconColor, valueColor = "text-foreground" }: Props) {
  const hasTrend = trend !== null && trend !== undefined;
  const isUp   = hasTrend && trend! > 0;
  const isDown = hasTrend && trend! < 0;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${valueColor}`}>{value}</p>
        {hasTrend && trendLabel && (
          <div className="flex items-center gap-1 mt-0.5">
            {isUp   && <TrendingUp  className="h-3 w-3 text-emerald-500 shrink-0" />}
            {isDown && <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />}
            {!isUp && !isDown && <Minus className="h-3 w-3 text-muted-foreground shrink-0" />}
            <p className={`text-xs font-medium ${isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-muted-foreground"}`}>
              {trendLabel}
            </p>
          </div>
        )}
        {subLabel && !trendLabel && (
          <p className="text-xs text-muted-foreground">{subLabel}</p>
        )}
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  );
}
