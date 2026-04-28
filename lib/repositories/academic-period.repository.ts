// lib/repositories/academic-period.repository.ts
// Layer 2 — DATA: Fetches academic period reference data via the API route.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { AcademicPeriod } from "@/lib/types/shared.types";

export const academicPeriodRepository = {
  async getAll(): Promise<AcademicPeriod[]> {
    const res = await authFetch("/api/academic-periods");

    if (!res.ok) {
      throw new Error("Failed to fetch academic periods");
    }

    const json = await res.json();
    return json.data as AcademicPeriod[];
  },
};
