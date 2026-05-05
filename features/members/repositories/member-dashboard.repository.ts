// features/members/repositories/member-dashboard.repository.ts
// Layer 2 — DATA: Fetches the signed-in member's own dashboard data via API route.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { MemberDashboard } from "@/lib/models";

export const memberDashboardRepository = {
  async get(): Promise<MemberDashboard> {
    const res = await authFetch("/api/dashboard/member");

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? "Failed to fetch member dashboard");
    }
    return json.data as MemberDashboard;
  },
};
