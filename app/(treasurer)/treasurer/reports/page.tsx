// app/(treasurer)/treasurer/reports/page.tsx
// Layer 4 — PRESENTATIONAL: Payment Summary Reporting page (Treasurer)

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { toast } from "sonner";
import { Printer, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { ReportPreview } from "@/features/reports/components/ReportPreview";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import {
  useGenerateReport,
  type GenerateReportResult,
} from "@/features/reports/hooks/useGenerateReport";
import type { GenerateReportInput } from "@/lib/models";

// Default date range: Jan 1 of current year → today
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function jan1ISO() {
  return `${new Date().getFullYear()}-01-01`;
}

const DEFAULT_FILTERS: GenerateReportInput = {
  reportType: "payment_summary",
  startDate: jan1ISO(),
  endDate:   todayISO(),
  format:    "json",
  collegeId: undefined,
};

/** Trigger a file download from a Blob */
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
  const [report, setReport]   = useState<GenerateReportResult | null>(null);

  const { mutate, isPending } = useGenerateReport();

  const handleGenerate = (formatOverride?: GenerateReportInput["format"]) => {
    const input = formatOverride ? { ...filters, format: formatOverride } : filters;
    setReport(null);

    mutate(input, {
      onSuccess: (res) => {
        if (res.format === "json") {
          setReport(res);
        } else {
          downloadBlob(res.blob!, res.fileName);
          toast.success(`${input.format.toUpperCase()} report downloaded`, {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Generate and export detailed reports for analysis
          </p>
        </div>

        {/* Action buttons — top right */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={isPending}>
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGenerate("excel")}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerate("pdf")}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters bar */}
      <ReportFilters
        values={filters}
        onChange={setFilters}
        onGenerate={() => handleGenerate()}
        isLoading={isPending}
      />

      {/* Loading state */}
      {isPending && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <LoadingSkeleton rows={6} />
        </div>
      )}

      {/* Report preview */}
      {report?.format === "json" && report.data && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <ReportPreview report={report.data} />
        </div>
      )}

      {/* Empty state */}
      {!report && !isPending && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center min-h-48">
          <p className="text-sm font-medium text-muted-foreground">
            Configure filters above and click &quot;Generate Report&quot;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Excel and PDF exports download automatically
          </p>
        </div>
      )}
    </div>
  );
}

