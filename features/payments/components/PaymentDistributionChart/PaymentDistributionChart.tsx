// features/payments/components/PaymentDistributionChart/PaymentDistributionChart.tsx
// Layer 4 — PRESENTATIONAL: Pie chart of payment collection by college/department

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import type { CollegeDistribution } from "@/lib/models";

const COLORS = ["#2196F3", "#FF9800", "#F44336", "#4CAF50", "#9C27B0", "#00BCD4", "#FF5722", "#607D8B"];

interface Props {
  data: CollegeDistribution[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: CollegeDistribution }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{d.collegeName}</p>
      <p className="text-muted-foreground">Collected: <span className="text-foreground font-medium">{formatCurrency(d.total)}</span></p>
      <p className="text-muted-foreground">Members: <span className="text-foreground font-medium">{d.memberCount}</span></p>
      <p className="text-muted-foreground">Share: <span className="text-foreground font-medium">{d.percent}%</span></p>
    </div>
  );
}

function LegendItem({ color, name, total, percent }: { color: string; name: string; total: number; percent: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs py-1">
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-muted-foreground truncate">{name}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-medium text-foreground">{formatCurrency(total)}</span>
        <span className="text-muted-foreground w-8 text-right">{percent}%</span>
      </div>
    </div>
  );
}

export function PaymentDistributionChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">No payment data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
      {/* Pie */}
      <div className="h-52 w-full lg:h-56 lg:w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              dataKey="total"
              nameKey="collegeName"
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 min-w-0 divide-y divide-border">
        {data.map((d, i) => (
          <LegendItem
            key={d.collegeId}
            color={COLORS[i % COLORS.length]}
            name={d.collegeName}
            total={d.total}
            percent={d.percent}
          />
        ))}
      </div>
    </div>
  );
}
