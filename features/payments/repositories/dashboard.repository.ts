// features/payments/repositories/dashboard.repository.ts
// Layer 2 — DATA: Fetches treasurer dashboard data via the API route.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { TreasurerDashboard } from "../types/dashboard.types";

export const dashboardRepository = {
  async getTreasurerDashboard(): Promise<TreasurerDashboard> {
    const res = await authFetch("/api/dashboard/treasurer");

    if (!res.ok) {
      throw new Error("Failed to fetch treasurer dashboard");
    }

    const json = await res.json();
    return json.data as TreasurerDashboard;
  },
};
