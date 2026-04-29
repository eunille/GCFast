// features/reports/hooks/useGenerateReport.ts
// Layer 3 — APPLICATION: Generates and fetches report data

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ReportFilters } from "@/features/reports/types/report.types";

interface UseGenerateReportParams extends ReportFilters {
  year: number;
}

export function useGenerateReport(params: UseGenerateReportParams | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["reports", params],
    queryFn: async () => {
      if (!params) return null;

      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: params.collegeId,
          year: params.year,
          startDate: params.startDate,
          endDate: params.endDate,
          format: "json",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate report");
      return res.json();
    },
    enabled: !!user && !!params,
    staleTime: 5 * 60 * 1000,
  });
}
