// features/members/components/MemberDashboard/StandingBanner.tsx
// Layer 4 — PRESENTATIONAL: Full-width banner showing member payment standing

import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PaymentStatus } from "@/lib/models";

interface Props {
  status: PaymentStatus;
  memberName: string;
}

export function StandingBanner({ status, memberName }: Props) {
  const isComplete = status === "COMPLETE";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-5 py-4 border",
        isComplete
          ? "bg-status-paid-bg border-status-paid"
          : "bg-status-outstanding-bg border-status-outstanding"
      )}
    >
      {isComplete ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-status-paid" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0 text-status-outstanding" />
      )}
      <div>
        <p
          className={cn(
            "text-sm font-semibold",
            isComplete ? "text-status-paid" : "text-status-outstanding"
          )}
        >
          {isComplete ? "All dues settled" : "Outstanding balance"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isComplete
            ? `${memberName}'s dues are fully paid for this period.`
            : `${memberName} has an outstanding balance. Please settle dues promptly.`}
        </p>
      </div>
    </div>
  );
}
