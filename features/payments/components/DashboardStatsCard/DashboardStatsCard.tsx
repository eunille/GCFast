// features/payments/components/DashboardStatsCard/DashboardStatsCard.tsx
// Layer 4 — PRESENTATIONAL: A single stat tile (label + number + optional sub-label)

interface Props {
  label: string;
  value: string | number;
  subLabel?: string;
  accent?: "default" | "success" | "danger" | "warning";
}

export function DashboardStatsCard(_props: Props) {
  return null;
}

