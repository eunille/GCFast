// features/payments/components/MonthlyTrendChart/MonthlyTrendChart.tsx
// Layer 4 — PRESENTATIONAL: Bar chart of monthly collection trend

"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import type { MonthlyTrendPoint } from "@/lib/models";

interface Props {
  data: MonthlyTrendPoint[];
  /** Total months to show; pads with empty months if needed */
  visibleMonths?: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">Collected: <span className="text-foreground font-medium">{formatCurrency(payload[0].value)}</span></p>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₱${(n / 1_000).toFixed(0)}k`;
  return `₱${n}`;
}

export function MonthlyTrendChart({ data, visibleMonths = 4 }: Props) {
  // Show only last N months
  const slice = data.slice(-visibleMonths);

  if (!slice.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">No trend data available.</p>
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={slice} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickFormatter={fmt}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="totalCollected" fill="#00BCD4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
