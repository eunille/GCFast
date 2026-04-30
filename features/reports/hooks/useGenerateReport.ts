// features/reports/hooks/useGenerateReport.ts
// Layer 3 — APPLICATION: Mutation to POST /api/reports/generate

"use client";

import { useMutation } from "@tanstack/react-query";
import { reportRepository } from "../repositories/report.repository";
import type { GenerateReportInput, ReportData } from "@/lib/models";

export interface GenerateReportResult {
  format: GenerateReportInput["format"];
  /** Populated when format = "json" */
  data?: ReportData;
  /** Populated when format = "excel" | "pdf" */
  blob?: Blob;
  fileName: string;
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async (input: GenerateReportInput): Promise<GenerateReportResult> => {
      const scope = input.collegeId ? `college-${input.collegeId.slice(0, 8)}` : "all-colleges";
      const ext   = input.format === "excel" ? "xlsx" : input.format;
      const fileName = `gfast-report-${input.year}-${scope}.${ext}`;

      const result = await reportRepository.generate(input);

      if (input.format === "json") {
        return { format: "json", data: result as ReportData, fileName };
      }
      return { format: input.format, blob: result as Blob, fileName };
    },
  });
}
