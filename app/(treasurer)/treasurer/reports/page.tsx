// app/(treasurer)/treasurer/reports/page.tsx
// Layer 4 — PRESENTATIONAL: Report generation page (Treasurer)

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { toast } from "sonner";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { ReportPreview } from "@/features/reports/components/ReportPreview";
import {
  useGenerateReport,
  type GenerateReportResult,
} from "@/features/reports/hooks/useGenerateReport";
import type { GenerateReportInput } from "@/lib/models";

const DEFAULT_FILTERS: GenerateReportInput = {
  year: new Date().getFullYear(),
  format: "json",
  collegeId: undefined,
};

/** Triggers a file download from a Blob — pattern from FRONTEND_PHASES.md */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<GenerateReportInput>(DEFAULT_FILTERS);
  const [result, setResult]   = useState<GenerateReportResult | null>(null);

  const { mutate, isPending } = useGenerateReport();

  const handleGenerate = () => {
    // Clear previous result on each new generation
    setResult(null);

    mutate(filters, {
      onSuccess: (res) => {
        if (res.format === "json") {
          setResult(res);
        } else {
          // Trigger browser download for excel / pdf
          downloadBlob(res.blob!, res.fileName);
          toast.success(`${filters.format.toUpperCase()} report downloaded`, {
            description: res.fileName,
          });
        }
      },
      onError: (err) => {
        toast.error("Failed to generate report", { description: err.message });
      },
    });
  };

  return (
    <div className="-m-6 p-6 min-h-full bg-white flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Generate collection reports by year, college, and format
        </p>
      </div>

      {/* Filters */}
      <ReportFilters
        values={filters}
        onChange={setFilters}
        onGenerate={handleGenerate}
        isLoading={isPending}
      />

      {/* Inline JSON preview */}
      {result?.format === "json" && result.data && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col gap-4">
          <p className="text-base font-semibold text-foreground">Report Results</p>
          <ReportPreview report={result.data} />
        </div>
      )}

      {/* Placeholder when no result yet */}
      {!result && !isPending && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Configure filters above and click &quot;Generate Report&quot;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Excel and PDF reports will download automatically
          </p>
        </div>
      )}
    </div>
  );
}

