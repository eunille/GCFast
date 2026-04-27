// components/common/StatusBadge/StatusBadge.tsx
// Layer 4 — PRESENTATIONAL: Generic status badge with configurable color

type StatusVariant = "success" | "warning" | "error" | "neutral";

interface Props {
  label: string;
  variant?: StatusVariant;
}

export function StatusBadge(_props: Props) {
  return null;
}
