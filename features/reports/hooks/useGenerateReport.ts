// features/reports/hooks/useGenerateReport.ts
// Layer 3 — APPLICATION: Generates and fetches report data

"use client";

import { useQuery } from "@tanstack/react-query";
import { reportRepository } from "../repositories/report.repository";
import type { ReportFilter, ReportRow } from "../types/report.types";

export function useGenerateReport(filter: ReportFilter | null) {
  return useQuery<ReportRow[]>({
    queryKey: ["reports", filter],
    queryFn: () => reportRepository.generate(filter!),
    enabled: filter !== null,
  });
}
