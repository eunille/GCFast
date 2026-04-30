// app/(treasurer)/treasurer/overview/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer analytics dashboard

"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { Users, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTreasurerDashboard } from "@/features/payments/hooks/useTreasurerDashboard";
import { DashboardStatCard } from "@/features/payments/components/DashboardStatCard";
import { PaymentDistributionChart } from "@/features/payments/components/PaymentDistributionChart";
import { MonthlyTrendChart } from "@/features/payments/components/MonthlyTrendChart";
import { DashboardPaymentTable } from "@/features/payments/components/DashboardPaymentTable";
import { formatCurrency } from "@/lib/utils/format";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TreasurerDashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useTreasurerDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Failed to load dashboard. Please refresh.
      </p>
    );
  }

  const collectionRate = data.totalMembers > 0
    ? Math.round((data.membersComplete / data.totalMembers) * 100)
    : 0;

  return (
    <div className="-m-6 p-6 min-h-full bg-white flex flex-col gap-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Treasurer Dashboard</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Monitor membership payments and track outstanding balances
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatCard
          label="Total Members"
          value={data.totalMembers}
          trend={data.newMembersThisMonth}
          trendLabel={`+${data.newMembersThisMonth} this month`}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
        />
        <DashboardStatCard
          label="Dues Collected"
          value={formatCurrency(data.totalCollected)}
          trend={data.collectedChange}
          trendLabel={
            data.collectedChange !== null
              ? `${data.collectedChange >= 0 ? "+" : ""}${formatCurrency(data.collectedChange)} from last month`
              : undefined
          }
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
        />
        <DashboardStatCard
          label="Outstanding Balance"
          value={data.membersWithBalance}
          subLabel={`${data.membersWithBalance} member(s) with balance`}
          trend={null}
          icon={<AlertCircle className="h-5 w-5" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
          valueColor="text-orange-500"
        />
        <DashboardStatCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          trend={data.collectionRateChange}
          trendLabel={
            data.collectionRateChange !== null
              ? `${data.collectionRateChange >= 0 ? "+" : ""}${data.collectionRateChange}% from last month`
              : undefined
          }
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-500"
          valueColor="text-purple-600"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Payment Distribution */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Payment Distribution</p>
            <p className="text-xs text-muted-foreground">By College/Department</p>
          </div>
          <PaymentDistributionChart data={data.collectionByCollege} />
        </div>

        {/* Monthly Collection Trend */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Monthly Collection Trend</p>
            <p className="text-xs text-muted-foreground">
              Last {data.monthlyTrend.length} months
            </p>
          </div>
          <MonthlyTrendChart data={data.monthlyTrend} visibleMonths={4} />
        </div>
      </div>

      {/* ── Payment Tracking ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Payment Tracking</p>
          <p className="text-xs text-muted-foreground">Monitor membership fees and monthly dues</p>
        </div>
        <DashboardPaymentTable
          onRecord={(id) =>
            router.push(id ? `/treasurer/payments/record?memberId=${id}` : "/treasurer/payments/record")
          }
        />
      </div>


    </div>
  );
}

