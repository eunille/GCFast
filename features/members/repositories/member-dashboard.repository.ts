// features/members/repositories/member-dashboard.repository.ts
// Layer 2 — DATA: Fetches the signed-in member's own dashboard data via API route.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { MemberDashboard } from "@/lib/models";

export const memberDashboardRepository = {
  async get(): Promise<MemberDashboard> {
    const res = await authFetch("/api/dashboard/member");

    if (!res.ok) {
      throw new Error("Failed to fetch member dashboard");
    }

    const json = await res.json();
    return json.data as MemberDashboard;
  },
};
