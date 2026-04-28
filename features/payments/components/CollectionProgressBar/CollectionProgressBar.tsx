// features/payments/components/CollectionProgressBar/CollectionProgressBar.tsx
// Layer 4 — PRESENTATIONAL: Shows collection total + member count per college

import { colors, typography, radius } from "@/theme";
import { formatCurrency } from "@/lib/utils/format";

interface Props {
  collegeName: string;
  total: number;       // total pesos collected from this college
  memberCount: number; // number of members in this college
}

export function CollectionProgressBar({ collegeName, total, memberCount }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {collegeName}
        </p>
        <p
          style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.xs,
          }}
        >
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>
      <div
        className="shrink-0 px-3 py-1"
        style={{
          background: colors.brand.subtle,
          borderRadius: radius.full,
        }}
      >
        <span
          style={{
            color: colors.brand.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}

