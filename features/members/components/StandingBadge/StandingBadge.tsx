// features/members/components/StandingBadge/StandingBadge.tsx
// Layer 4 — PRESENTATIONAL: Paid/Not Paid badge — outlined style matching Figma

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface Props {
  isActive: boolean;
}

export function StandingBadge({ isActive }: Props) {
  return (
    <Badge
      className={cn(
        "rounded-md px-2.5 py-0.5 text-xs font-semibold border",
        isActive
          ? "bg-status-paid-bg text-status-paid border-status-paid"
          : "bg-status-outstanding-bg text-status-outstanding border-status-outstanding"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

