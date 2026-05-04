// features/members/components/MemberDashboard/BalanceSummaryCard.tsx
// Layer 4 — PRESENTATIONAL: Shows membership fee status, dues progress, and outstanding balance

import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { MemberType } from "@/lib/models";

interface Props {
  memberType: MemberType;
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  outstandingBalance: number;
}

export function BalanceSummaryCard({
  memberType,
  membershipFeePaid,
  periodsExpected,
  periodsPaid,
  outstandingBalance,
}: Props) {
  const progressPct =
    periodsExpected > 0
      ? Math.min(Math.round((periodsPaid / periodsExpected) * 100), 100)
      : 100;

  const hasBalance = outstandingBalance > 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Payment Standing
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Membership fee — FULL_TIME only */}
        {memberType === "FULL_TIME" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Membership Fee</span>
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                membershipFeePaid ? "text-status-paid" : "text-status-outstanding"
              )}
            >
              {membershipFeePaid ? (
                <><CheckCircle2 className="h-4 w-4" /> Paid</>
              ) : (
                <><XCircle className="h-4 w-4" /> Unpaid</>
              )}
            </div>
          </div>
        )}

        {/* Monthly dues progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly Dues</span>
            <span className="font-medium text-foreground">
              {periodsPaid} / {periodsExpected} months
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progressPct >= 100 ? "bg-status-paid" : "bg-status-outstanding"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{progressPct}% complete</p>
        </div>

        {/* Outstanding balance */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-foreground">Outstanding Balance</span>
          <span
            className={cn(
              "text-sm font-bold",
              hasBalance ? "text-status-outstanding" : "text-status-paid"
            )}
          >
            {formatCurrency(outstandingBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

