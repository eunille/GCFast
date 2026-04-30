// features/reports/repositories/report.repository.ts
// Layer 2 — DATA: Calls /api/reports/generate via authFetch. No JSX. No React hooks.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { GenerateReportInput, ReportData } from "@/lib/models";

export const reportRepository = {
  /**
   * POST /api/reports/generate
   * - format "json"  → returns ReportData parsed from JSON
   * - format "excel" | "pdf" → returns raw Blob for browser download
   */
  async generate(input: GenerateReportInput): Promise<ReportData | Blob> {
    const res = await authFetch("/api/reports/generate", {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      let msg = `Report generation failed (${res.status})`;
      try {
        const json = await res.json() as { error?: { message?: string } };
        if (json.error?.message) msg = json.error.message;
      } catch { /* ignore */ }
      throw new Error(msg);
    }

    if (input.format === "json") {
      const json = await res.json() as { success: true; data: ReportData };
      return json.data;
    }

    // excel / pdf — return raw blob
    return res.blob();
  },
};
