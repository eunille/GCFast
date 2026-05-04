// app/(member)/member/dashboard/page.tsx
// Layer 4 — PRESENTATIONAL: Member self-service dashboard

"use client";

export const dynamic = "force-dynamic";

import {
  CheckCircle2,
  XCircle,
  ClipboardList,
  Wallet,
  TrendingUp,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberDashboard } from "@/features/members/hooks/useMemberDashboard";
import { usePaymentHistory } from "@/features/payments/hooks/usePaymentHistory";
import { DuesGrid } from "@/features/members/components/MemberDashboard/DuesGrid";
import { PaymentHistoryTable } from "@/features/payments/components/PaymentHistoryTable";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: ReactNode;
  sublabel: string;
  icon: ReactNode;
  iconClass: string;
}

function StatCard({ label, value, sublabel, icon, iconClass }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
          <div
            className={cn(
              "h-11 w-11 shrink-0 rounded-full flex items-center justify-center",
              iconClass
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Export helper ─────────────────────────────────────────────────────────────

function exportPaymentsCSV(
  payments: { paymentDate: string; paymentType: string; amountPaid: number; referenceNumber: string | null }[],
  year: number
) {
  const headers = ["Date", "Description", "Amount (PHP)", "Status", "Reference"];
  const rows = payments.map((p) => {
    const month = new Date(p.paymentDate).toLocaleString("en-PH", { month: "long" });
    const desc = p.paymentType === "MEMBERSHIP_FEE" ? "Membership Fee" : `Monthly Dues - ${month}`;
    return [p.paymentDate, desc, p.amountPaid.toFixed(2), "Paid", p.referenceNumber ?? ""];
  });
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payment-history-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MemberDashboardPage() {
  const { data, isLoading, isError } = useMemberDashboard();
  const { data: historyData, isLoading: historyLoading } = usePaymentHistory(
    data?.memberId ?? null
  );

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Failed to load your dashboard. Please refresh.
      </p>
    );
  }

  const currentYear = new Date().getFullYear();
  const allPayments = historyData?.data ?? [];

  // Derive totals from payment history
  const totalPaidThisYear = allPayments
    .filter((p) => new Date(p.paymentDate).getFullYear() === currentYear)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const membershipFeeAmountPaid = allPayments
    .filter((p) => p.paymentType === "MEMBERSHIP_FEE")
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Dues completion relative to expected periods (not full 12)
  const duesCompletion =
    data.periodsExpected > 0
      ? Math.round((data.periodsPaid / data.periodsExpected) * 100)
      : data.periodsPaid > 0
        ? 100
        : 0;

  const firstName = data.fullName.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Welcome back, {firstName}!
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Membership Fee */}
        <StatCard
          label="Membership Fee"
          value={
            <span className={data.membershipFeePaid ? "text-status-paid" : "text-status-outstanding"}>
              {data.membershipFeePaid ? "Paid" : "Unpaid"}
            </span>
          }
          sublabel={
            data.memberType === "FULL_TIME"
              ? data.membershipFeePaid
                ? formatCurrency(membershipFeeAmountPaid)
                : "Not yet paid"
              : "N/A — Associate"
          }
          iconClass="bg-emerald-50"
          icon={
            data.membershipFeePaid
              ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              : <XCircle className="h-5 w-5 text-red-400" />
          }
        />

        {/* Monthly Dues Paid */}
        <StatCard
          label="Monthly Dues Paid"
          value={`${data.periodsPaid}/${data.periodsExpected}`}
          sublabel={`${duesCompletion}% Complete`}
          iconClass="bg-blue-50"
          icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
        />

        {/* Total Paid (Year) */}
        <StatCard
          label={`Total Paid (${currentYear})`}
          value={formatCurrency(totalPaidThisYear)}
          sublabel="This year"
          iconClass="bg-violet-50"
          icon={<Wallet className="h-5 w-5 text-violet-500" />}
        />

        {/* Outstanding */}
        <StatCard
          label="Outstanding"
          value={
            <span className={data.outstandingBalance > 0 ? "text-status-outstanding" : "text-status-paid"}>
              {formatCurrency(data.outstandingBalance)}
            </span>
          }
          sublabel={data.outstandingBalance > 0 ? "Please settle dues" : "All caught up"}
          iconClass={data.outstandingBalance > 0 ? "bg-red-50" : "bg-emerald-50"}
          icon={<TrendingUp className={cn("h-5 w-5", data.outstandingBalance > 0 ? "text-red-400" : "text-emerald-500")} />}
        />

      </div>

      {/* ── Monthly dues status ─────────────────────────────────────────────── */}
      <DuesGrid monthsPaid={data.monthsPaid} yearRef={currentYear} />

      {/* ── Recent payments ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Recent Payments
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your latest payment transactions
              </p>
            </div>
            {allPayments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => exportPaymentsCSV(allPayments, currentYear)}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <PaymentHistoryTable
            payments={allPayments}
            isLoading={historyLoading}
          />
        </CardContent>
      </Card>

    </div>
  );
}
