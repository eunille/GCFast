// features/payments/components/DashboardStatsCard/DashboardStatsCard.tsx
// Layer 4 — PRESENTATIONAL: A single stat tile (label + number + optional sub-label + icon)

import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  accent?: "default" | "success" | "danger";
  icon?: ReactNode;
}

const iconBgClass: Record<NonNullable<Props["accent"]>, string> = {
  default: "bg-blue-100",
  success: "bg-emerald-100",
  danger:  "bg-orange-100",
};

const iconColorClass: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-blue-500",
  success: "text-emerald-500",
  danger:  "text-orange-500",
};

const valueColorClass: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-foreground",
  success: "text-status-paid",
  danger:  "text-status-outstanding",
};

export function DashboardStatsCard({ label, value, subLabel, accent = "default", icon }: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white py-2.5 px-4 shadow-sm">
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${valueColorClass[accent]}`}>{value}</p>
        {subLabel && (
          <p className="text-xs text-muted-foreground">{subLabel}</p>
        )}
      </div>
      {icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBgClass[accent]}`}>
          <div className={iconColorClass[accent]}>{icon}</div>
        </div>
      )}
    </div>
  );
}


