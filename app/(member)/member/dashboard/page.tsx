// app/(member)/member/dashboard/page.tsx
// Layer 4 — PRESENTATIONAL: Member self-service dashboard

"use client";

export const dynamic = "force-dynamic";

import { Calendar, CreditCard, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberDashboard } from "@/features/members/hooks/useMemberDashboard";
import { usePaymentHistory } from "@/features/payments/hooks/usePaymentHistory";
import { StandingBanner } from "@/features/members/components/MemberDashboard/StandingBanner";
import { BalanceSummaryCard } from "@/features/members/components/MemberDashboard/BalanceSummaryCard";
import { DuesGrid } from "@/features/members/components/MemberDashboard/DuesGrid";
import { PaymentHistoryTable } from "@/features/payments/components/PaymentHistoryTable";
import { formatDate } from "@/lib/utils/format";

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="col-span-2 h-48 rounded-xl" />
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
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

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Dashboard</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Your membership and payment standing for this period.
        </p>
      </div>

      {/* Standing banner */}
      <StandingBanner status={data.status} memberName={data.fullName} />

      {/* Profile + Balance row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card>
          <CardContent className="pt-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold shrink-0">
                {data.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{data.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {data.memberType === "FULL_TIME" ? "Full-Time" : "Associate"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {data.college && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{data.college}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{data.periodsPaid} of {data.periodsExpected} months paid</span>
              </div>
              {data.lastPaymentDate && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Last payment: {formatDate(data.lastPaymentDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance summary */}
        <div className="lg:col-span-2">
          <BalanceSummaryCard
            memberType={data.memberType}
            membershipFeePaid={data.membershipFeePaid}
            periodsExpected={data.periodsExpected}
            periodsPaid={data.periodsPaid}
            outstandingBalance={data.outstandingBalance}
          />
        </div>
      </div>

      {/* Monthly dues grid */}
      <DuesGrid monthsPaid={data.monthsPaid} yearRef={new Date().getFullYear()} />

      {/* Payment history */}
      <Card>
        <CardContent className="pt-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Payment History</h2>
          <PaymentHistoryTable
            payments={historyData?.data ?? []}
            isLoading={historyLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

