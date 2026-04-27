// lib/hooks/useColleges.ts
// Layer 3 — APPLICATION: Fetches all colleges for dropdowns

"use client";

import { useQuery } from "@tanstack/react-query";
import { collegeRepository } from "@/lib/repositories/college.repository";
import type { College } from "@/lib/types/shared.types";

export function useColleges() {
  return useQuery<College[]>({
    queryKey: ["colleges"],
    queryFn: () => collegeRepository.getAll(),
    staleTime: 5 * 60 * 1000, // colleges rarely change — cache for 5 min
  });
}
