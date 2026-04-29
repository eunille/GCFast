// features/payments/components/DashboardStatsCard/DashboardStatsCard.tsx
// Layer 4 — PRESENTATIONAL: A single stat tile (label + number + optional sub-label)

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  accent?: "default" | "success" | "danger";
}

const valueClass: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-accent",
  success: "text-status-paid",
  danger:  "text-status-outstanding",
};

export function DashboardStatsCard({ label, value, subLabel, accent = "default" }: Props) {
  return (
    <Card className="rounded-xl shadow-md border-0 bg-card">
      <CardContent className="flex flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-3xl font-bold leading-none", valueClass[accent])}>
          {value}
        </p>
        {subLabel && (
          <p className="text-xs text-muted-foreground">{subLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

