// app/(treasurer)/treasurer/payments/page.tsx
// Layer 4 — PRESENTATIONAL: Payment management page (Treasurer)

"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { DollarSign, Users, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatsCard } from "@/features/payments/components/DashboardStatsCard";
import { RecentTransactionsTable } from "@/features/payments/components/RecentTransactionsTable";
import { useTreasurerDashboard } from "@/features/payments/hooks/useTreasurerDashboard";
import { formatCurrency } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const { data: dashboard, isLoading } = useTreasurerDashboard();

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Track and manage all payment transactions
        </p>
      </div>

      {/* ── Stats cards ──────────────────────────────────────────────── */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <DashboardStatsCard
            label="Total Collected"
            value={dashboard ? formatCurrency(dashboard.totalCollected) : "—"}
            subLabel={dashboard ? `${dashboard.totalMembers} active members` : undefined}
            accent="default"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <DashboardStatsCard
            label="Members with Balance"
            value={dashboard?.membersWithBalance ?? "—"}
            subLabel="outstanding dues"
            accent="danger"
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <DashboardStatsCard
            label="Members All Paid"
            value={dashboard?.membersComplete ?? "—"}
            subLabel="fully paid"
            accent="success"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <DashboardStatsCard
            label="Total Members"
            value={dashboard?.totalMembers ?? "—"}
            subLabel="active members"
            accent="default"
            icon={<Users className="h-5 w-5" />}
          />
        </div>
      )}

      {/* ── Recent Transactions ───────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <RecentTransactionsTable
            onRecord={() => router.push("/treasurer/payments/record")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

