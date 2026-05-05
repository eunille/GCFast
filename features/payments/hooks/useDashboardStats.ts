// features/payments/hooks/useDashboardStats.ts
// Layer 3 — APPLICATION: Derives dashboard summary stats from payment summaries

"use client";

import { useMemo } from "react";
import { usePayments } from "./usePayments";
import type { DashboardStats } from "../types/dashboard.types";

export function useDashboardStats(collegeId?: string): {
  stats: DashboardStats | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = usePayments(collegeId);

  const stats = useMemo<DashboardStats | null>(() => {
    if (!data) return null;

    const totalMembers = data.length;
    const membersPaidInFull = data.filter((m) => m.status === "COMPLETE").length;
    const membersWithBalance = totalMembers - membersPaidInFull;
    const totalCollected = data.reduce(
      (sum, m) => sum + m.months_paid.length * 100 + (m.membership_fee_paid ? 200 : 0),
      0
    );
    const totalOutstanding = data.reduce((sum, m) => sum + m.outstanding_balance, 0);
    const collectionRate =
      totalMembers === 0 ? 0 : Math.round((membersPaidInFull / totalMembers) * 100);

    return {
      totalMembers,
      membersPaidInFull,
      membersWithBalance,
      totalCollected,
      totalOutstanding,
      collectionRate,
    };
  }, [data]);

  return { stats, isLoading, isError };
}
