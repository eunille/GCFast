// features/members/components/StandingBadge/StandingBadge.tsx
// Layer 4 — PRESENTATIONAL: Active/Inactive badge using theme tokens

import { colors } from "@/theme";

interface Props {
  isActive: boolean;
}

export function StandingBadge({ isActive }: Props) {
  return (
    <span
      style={{
        backgroundColor: isActive ? colors.status.paidBg : colors.status.outstandingBg,
        color: isActive ? colors.status.paid : colors.status.outstanding,
      }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

