// app/(treasurer)/treasurer/overview/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer dashboard overview page

"use client";

import Link from "next/link";
import { useTreasurerDashboard } from "@/features/payments/hooks/useTreasurerDashboard";
import { DashboardStatsCard } from "@/features/payments/components/DashboardStatsCard";
import { CollectionProgressBar } from "@/features/payments/components/CollectionProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { colors, typography, radius, shadows, spacing } from "@/theme";

export const dynamic = "force-dynamic";

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function TreasurerOverviewPage() {
  const { data, isLoading, isError } = useTreasurerDashboard();

  if (isLoading) return <OverviewSkeleton />;

  if (isError || !data) {
    return (
      <p style={{ color: colors.status.outstanding, fontSize: typography.fontSize.sm }}>
        Failed to load dashboard. Please refresh.
      </p>
    );
  }

  const membersComplete = data.membersComplete ?? 0;
  const totalMembers    = data.totalMembers ?? 0;
  const collectionRate  = totalMembers > 0
    ? Math.round((membersComplete / totalMembers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1
          style={{
            color: colors.text.primary,
            fontSize: typography.fontSize["2xl"],
            fontWeight: typography.fontWeight.bold,
          }}
        >
          Overview
        </h1>
        <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
          Current collection summary
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStatsCard
          label="Total Members"
          value={data.totalMembers}
        />
        <DashboardStatsCard
          label="Total Collected"
          value={formatCurrency(data.totalCollected)}
          accent="success"
        />
        <DashboardStatsCard
          label="With Balance"
          value={data.membersWithBalance}
          accent="danger"
        />
        <DashboardStatsCard
          label="Complete"
          value={data.membersComplete}
          subLabel={`${collectionRate}% collection rate`}
          accent="success"
        />
      </div>

      {/* Collection by college */}
      <Card
        style={{
          background: colors.surface.page,
          borderRadius: radius.xl,
          boxShadow: shadows.base,
          border: "none",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle
            style={{
              color: colors.text.primary,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            Collection by College
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {data.collectionByCollege.length === 0 ? (
            <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
              No data yet.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: colors.brand.subtle }}>
              {data.collectionByCollege.map((college) => (
                <CollectionProgressBar
                  key={college.collegeId}
                  collegeName={college.collegeName}
                  total={college.total}
                  memberCount={college.memberCount}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator style={{ background: colors.brand.subtle }} />

      {/* Quick links */}
      <div className="flex gap-3">
        <Button
          asChild
          style={{
            background: colors.brand.primary,
            color: colors.surface.page,
            borderRadius: radius.md,
            fontSize: typography.fontSize.sm,
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
          }}
        >
          <Link href="/treasurer/members">View Members</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          style={{
            borderColor: colors.brand.primary,
            color: colors.brand.primary,
            borderRadius: radius.md,
            fontSize: typography.fontSize.sm,
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
          }}
        >
          <Link href="/treasurer/payments">View Payments</Link>
        </Button>
      </div>
    </div>
  );
}

