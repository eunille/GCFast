// features/members/components/StandingBadge/StandingBadge.tsx
// Layer 4 — PRESENTATIONAL: Member status badge (Active / Pending / Inactive)

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { AccountStatus } from "@/lib/models";

interface Props {
  isActive: boolean;
  accountStatus?: AccountStatus;
}

export function StandingBadge({ isActive, accountStatus }: Props) {
  // Pending (auth account pending approval) takes highest priority
  if (accountStatus === "pending") {
    return (
      <Badge className="rounded-md px-2.5 py-0.5 text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-300">
        Pending
      </Badge>
    );
  }

  if (accountStatus === "rejected") {
    return (
      <Badge className="rounded-md px-2.5 py-0.5 text-xs font-semibold border bg-red-50 text-red-700 border-red-300">
        Rejected
      </Badge>
    );
  }

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

