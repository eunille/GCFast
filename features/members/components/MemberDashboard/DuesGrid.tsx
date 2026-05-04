// features/members/components/MemberDashboard/DuesGrid.tsx
// Layer 4 — PRESENTATIONAL: 12-month dues status table (2-panel layout)

import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Props {
  monthsPaid: number[];
  yearRef?: number;
}

function PanelHeader() {
  return (
    <div className="grid grid-cols-[1fr_60px_32px] items-center px-4 py-2 bg-muted/50 border-b border-border">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Month
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
        Status
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
        Paid
      </span>
    </div>
  );
}

export function DuesGrid({ monthsPaid, yearRef }: Props) {
  const year = yearRef ?? new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  const paid = new Set(monthsPaid);
  const paidCount = monthsPaid.length;
  const pct = Math.round((paidCount / 12) * 100);

  const renderRow = (month: number) => {
    const isPaid = paid.has(month);
    const isCurrentMonth = month === currentMonth;
    const mm = String(month).padStart(2, "0");

    return (
      <div
        key={month}
        className="grid grid-cols-[1fr_60px_32px] items-center px-4 py-3 border-b border-border last:border-0 gap-2"
      >
        {/* Month number + name + Now badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs tabular-nums text-muted-foreground w-5 shrink-0">{mm}</span>
          <span className="text-sm font-medium text-foreground truncate">
            {MONTH_NAMES[month - 1]}
          </span>
          {isCurrentMonth && (
            <span className="shrink-0 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 leading-none border border-amber-200">
              Now
            </span>
          )}
        </div>

        {/* Status text */}
        <span
          className={cn(
            "text-sm font-medium text-center",
            isPaid ? "text-status-paid" : "text-muted-foreground"
          )}
        >
          {isPaid ? "Paid" : "Pending"}
        </span>

        {/* Paid icon */}
        <div className="flex justify-end">
          {isPaid ? (
            <CheckCircle2 className="h-4 w-4 text-status-paid" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground/30" />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          {year} Monthly Dues Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {paidCount} of 12 months paid &bull; {pct}% complete
        </p>
      </CardHeader>
      <CardContent className="p-0 pb-0">
        <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
          {/* Jan – Jun */}
          <div>
            <PanelHeader />
            {[1, 2, 3, 4, 5, 6].map(renderRow)}
          </div>
          {/* Jul – Dec */}
          <div>
            <PanelHeader />
            {[7, 8, 9, 10, 11, 12].map(renderRow)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
