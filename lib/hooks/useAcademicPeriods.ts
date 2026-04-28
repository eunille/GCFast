// lib/hooks/useAcademicPeriods.ts
// Layer 3 — APPLICATION: Fetches all academic periods for dropdowns/pickers.

"use client";

import { useQuery } from "@tanstack/react-query";
import { academicPeriodRepository } from "@/lib/repositories/academic-period.repository";
import type { AcademicPeriod } from "@/lib/types/shared.types";

export function useAcademicPeriods() {
  return useQuery<AcademicPeriod[]>({
    queryKey: ["academic-periods"],
    queryFn: () => academicPeriodRepository.getAll(),
    staleTime: 5 * 60 * 1000, // academic periods rarely change — cache for 5 min
  });
}
