// features/payments/hooks/useTreasurerDashboard.ts
// Layer 3 — APPLICATION: Fetches treasurer dashboard aggregate stats.

"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardRepository } from "@/features/payments/repositories/dashboard.repository";
import type { TreasurerDashboard } from "@/features/payments/types/dashboard.types";

export function useTreasurerDashboard() {
  return useQuery<TreasurerDashboard>({
    queryKey: ["dashboard", "treasurer"],
    queryFn: () => dashboardRepository.getTreasurerDashboard(),
    staleTime: 60 * 1000, // cached server-side for 60s — match API revalidate
  });
}
