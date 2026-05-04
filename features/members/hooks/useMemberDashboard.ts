// features/members/hooks/useMemberDashboard.ts
// Layer 3 — APPLICATION: Fetches the signed-in member's own dashboard standing.

"use client";

import { useQuery } from "@tanstack/react-query";
import { memberDashboardRepository } from "../repositories/member-dashboard.repository";
import type { MemberDashboard } from "@/lib/models";

export function useMemberDashboard() {
  return useQuery<MemberDashboard>({
    queryKey: ["dashboard", "member"],
    queryFn: () => memberDashboardRepository.get(),
    staleTime: 30 * 1000,
  });
}
