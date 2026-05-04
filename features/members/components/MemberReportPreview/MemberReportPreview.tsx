// features/members/components/MemberReportPreview/MemberReportPreview.tsx
// Layer 4 — PRESENTATIONAL: Member-scoped payment report — matches Treasurer report UI

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle2, ClipboardList, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { MemberReportData } from "../../hooks/useMemberReport";

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ label, value, sub, icon, iconBg }: MetricCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  report: MemberReportData;
}

export function MemberReportPreview({ report }: Props) {
  const paidRows   = report.rows.filter((r) => r.isPaid);
  const totalLabel = `${report.monthsPaidCount}/12 Paid`;

  return (
    <div className="flex flex-col gap-6">

      {/* Report header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Payment Summary — {report.year}
            </p>
            <p className="text-sm text-muted-foreground">
              Detailed breakdown of all payments
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-0">Report Ready</Badge>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Paid"
          value={formatCurrency(report.totalPaid)}
          sub={`Year ${report.year}`}
          icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <MetricCard
          label="Membership Fee"
          value={report.membershipFeePaid ? formatCurrency(report.membershipFeeAmount) : "Unpaid"}
          sub={report.membershipFeePaid ? "Paid" : "Not yet settled"}
          icon={<CheckCircle2 className={`h-5 w-5 ${report.membershipFeePaid ? "text-emerald-500" : "text-red-400"}`} />}
          iconBg={report.membershipFeePaid ? "bg-emerald-100" : "bg-red-100"}
        />
        <MetricCard
          label="Monthly Dues"
          value={formatCurrency(report.monthlyDuesTotal)}
          sub={`${report.monthsPaidCount} month${report.monthsPaidCount !== 1 ? "s" : ""} paid`}
          icon={<ClipboardList className="h-5 w-5 text-violet-500" />}
          iconBg="bg-violet-100"
        />
        <MetricCard
          label="Avg. Monthly"
          value={formatCurrency(report.avgMonthly)}
          sub="Per month"
          icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
          iconBg="bg-amber-100"
        />
      </div>

      {/* Month-by-month table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="text-right">Receipt No.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.rows.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>
                  {row.isPaid ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Paid</Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">Unpaid</Badge>
                  )}
                </TableCell>
                <TableCell className={`text-right font-medium ${row.isPaid ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {row.amount !== null ? formatCurrency(row.amount) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.paymentDate ? fmtDate(row.paymentDate) : "—"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.referenceNumber ? `#${row.referenceNumber}` : "—"}
                </TableCell>
              </TableRow>
            ))}

            {/* Total row */}
            <TableRow className="bg-muted/30">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="font-bold">{totalLabel}</TableCell>
              <TableCell className="text-right font-bold text-emerald-600">
                {formatCurrency(report.monthlyDuesTotal)}
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Footer timestamp */}
      <p className="text-xs text-muted-foreground">
        Report generated on{" "}
        {new Date(report.generatedAt).toLocaleDateString("en-PH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        at{" "}
        {new Date(report.generatedAt).toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
    </div>
  );
}
