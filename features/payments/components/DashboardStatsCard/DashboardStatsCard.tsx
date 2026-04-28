// features/payments/components/DashboardStatsCard/DashboardStatsCard.tsx
// Layer 4 — PRESENTATIONAL: A single stat tile (label + number + optional sub-label)

import { Card, CardContent } from "@/components/ui/card";
import { colors, typography, radius, shadows } from "@/theme";

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  accent?: "default" | "success" | "danger";
}

const accentColor: Record<NonNullable<Props["accent"]>, string> = {
  default: colors.brand.accent,
  success: colors.status.paid,
  danger:  colors.status.outstanding,
};

export function DashboardStatsCard({ label, value, subLabel, accent = "default" }: Props) {
  const valueColor = accentColor[accent];

  return (
    <Card
      style={{
        background: colors.surface.page,
        borderRadius: radius.xl,
        boxShadow: shadows.base,
        border: "none",
      }}
    >
      <CardContent className="flex flex-col gap-2 p-5">
        <p
          style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: valueColor,
            fontSize: typography.fontSize["3xl"],
            fontWeight: typography.fontWeight.bold,
            lineHeight: "1",
          }}
        >
          {value}
        </p>
        {subLabel && (
          <p
            style={{
              color: colors.text.secondary,
              fontSize: typography.fontSize.xs,
            }}
          >
            {subLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

