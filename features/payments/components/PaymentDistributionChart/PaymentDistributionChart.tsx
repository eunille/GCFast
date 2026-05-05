// features/payments/components/PaymentDistributionChart/PaymentDistributionChart.tsx
// Layer 4 — PRESENTATIONAL: Pie chart of payment collection by college/department

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import type { CollegeDistribution } from "@/lib/models";

const COLORS = ["#2196F3", "#FF9800", "#F44336", "#4CAF50", "#9C27B0", "#00BCD4", "#FF5722", "#607D8B"];

interface Props {
  data: CollegeDistribution[];
}

function shortenName(name: string): string {
  return name
    .replace("College of ", "College of ")
    .replace("Administration", "Admin")
    .replace("Technology", "Tech")
    .replace("Sciences", "Sciences")
    .replace("Information", "IT")
    .replace("College of IT Tech", "College of IT");
}

function formatAmount(total: number): string {
  if (total >= 1_000_000) return `₱${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `₱${Math.round(total / 1_000)}k`;
  return formatCurrency(total);
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CollegeDistribution }> }) {
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

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) {
  // Only label slices that are large enough to avoid overlap (≥ 15%)
  if ((percent ?? 0) < 0.15) return null;
  const RADIAN = Math.PI / 180;
  const inner = (innerRadius as number) ?? 0;
  const outer = (outerRadius as number) ?? 0;
  const radius = inner + (outer - inner) * 0.5;
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontWeight={700}>
      {`${Math.round((percent as number) * 100)}%`}
    </text>
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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      {/* Pie */}
      <div className="h-56 w-full lg:h-52 lg:w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="38%"
              outerRadius="88%"
              dataKey="total"
              nameKey="collegeName"
              paddingAngle={2}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.collegeId} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground truncate">{shortenName(d.collegeName)}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-medium text-foreground">{formatAmount(d.total)}</span>
              <span className="text-muted-foreground w-7 text-right">{d.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
