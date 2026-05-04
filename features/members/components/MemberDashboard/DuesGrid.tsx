// features/members/components/MemberDashboard/DuesGrid.tsx
// Layer 4 — PRESENTATIONAL: 12-month paid/unpaid grid

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMonthShort } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface Props {
  monthsPaid: number[];
  yearRef?: number;
}

export function DuesGrid({ monthsPaid, yearRef }: Props) {
  const year = yearRef ?? new Date().getFullYear();
  const paid = new Set(monthsPaid);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Monthly Dues — {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
            const isPaid = paid.has(month);
            return (
              <div
                key={month}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg py-3 gap-0.5",
                  isPaid
                    ? "bg-status-paid-bg border border-status-paid"
                    : "bg-muted border border-border"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    isPaid ? "text-status-paid" : "text-muted-foreground"
                  )}
                >
                  {formatMonthShort(month)}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    isPaid ? "text-status-paid" : "text-muted-foreground/50"
                  )}
                >
                  {isPaid ? "✓" : "–"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

