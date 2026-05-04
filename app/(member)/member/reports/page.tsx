// app/(member)/member/reports/page.tsx
// Layer 4 — PRESENTATIONAL: Member self-service payment reports page

"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import { Printer, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberReport } from "@/features/members/hooks/useMemberReport";
import { MemberReportPreview } from "@/features/members/components/MemberReportPreview";
import { formatCurrency } from "@/lib/utils/format";

// ─── Year range helpers ───────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2023 }, (_, i) => CURRENT_YEAR - i);

// ─── PDF export ──────────────────────────────────────────────────────────────

function exportToPDF(year: number) {
  window.print();
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberReportsPage() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [generated, setGenerated]       = useState(false);

  const { reportData, isLoading, isError } = useMemberReport(selectedYear);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const showReport = generated && !isLoading && reportData;

  return (
    <div className="-m-6 p-6 min-h-full bg-white flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Reports</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            View and export your payment history and reports
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={!showReport}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          <Button
            size="sm"
            disabled={!showReport}
            onClick={() => exportToPDF(selectedYear)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Year selector */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-year">Year</Label>
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => {
              setSelectedYear(Number(v));
              setGenerated(false);
            }}
          >
            <SelectTrigger id="report-year" className="w-28 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="self-end"
        >
          {isLoading && generated ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
          ) : (
            "Generate Report"
          )}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && generated && <ReportSkeleton />}

      {/* Error state */}
      {isError && (
        <p className="text-sm text-destructive py-8 text-center">
          Failed to load report data. Please refresh.
        </p>
      )}

      {/* Report preview */}
      {showReport && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm print:shadow-none print:border-0">
          <MemberReportPreview report={reportData} />
        </div>
      )}

      {/* Empty / prompt state */}
      {!generated && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center min-h-48">
          <p className="text-sm font-medium text-muted-foreground">
            Select a year and click &quot;Generate Report&quot;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF export available after generating
          </p>
        </div>
      )}

    </div>
  );
}
