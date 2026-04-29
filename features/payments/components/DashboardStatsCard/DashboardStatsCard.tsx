// features/payments/components/DashboardStatsCard/DashboardStatsCard.tsx
// Layer 4 — PRESENTATIONAL: A single stat tile (label + number + optional sub-label + icon)

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  accent?: "default" | "success" | "danger";
  icon?: ReactNode;
}

const valueClass: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-accent",
  success: "text-status-paid",
  danger:  "text-status-outstanding",
};

export function DashboardStatsCard({ label, value, subLabel, accent = "default", icon }: Props) {
  return (
    <Card className="rounded-xl shadow-md border-0 bg-card">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-2 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-3xl font-bold leading-none", valueClass[accent])}>
            {value}
          </p>
          {subLabel && (
            <p className="text-xs text-muted-foreground">{subLabel}</p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

