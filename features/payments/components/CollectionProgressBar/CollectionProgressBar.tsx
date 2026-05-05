// features/payments/components/CollectionProgressBar/CollectionProgressBar.tsx
// Layer 4 — PRESENTATIONAL: Shows collection total + member count per college

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
        <p className="truncate text-sm font-medium text-foreground">{collegeName}</p>
        <p className="text-xs text-muted-foreground">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>
      <div className="shrink-0 px-3 py-1 bg-[#D6E4F0] rounded-full">
        <span className="text-sm font-semibold text-[#2E86C1]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
