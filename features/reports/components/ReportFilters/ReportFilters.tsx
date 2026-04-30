// features/reports/components/ReportFilters/ReportFilters.tsx
// Layer 4 — PRESENTATIONAL: Year, format, college filter form for report generation

"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useColleges } from "@/lib/hooks/useColleges";
import { FileSpreadsheet, FileText, Braces, Loader2 } from "lucide-react";
import type { GenerateReportInput } from "@/lib/models";

interface Props {
  values: GenerateReportInput;
  onChange: (v: GenerateReportInput) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const FORMAT_OPTIONS: { value: GenerateReportInput["format"]; label: string; icon: React.ReactNode }[] = [
  { value: "json",  label: "View Online",  icon: <Braces className="h-4 w-4" /> },
  { value: "excel", label: "Excel (.xlsx)", icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: "pdf",   label: "PDF",           icon: <FileText className="h-4 w-4" /> },
];

export function ReportFilters({ values, onChange, onGenerate, isLoading }: Props) {
  const { data: colleges = [] } = useColleges();

  const set = <K extends keyof GenerateReportInput>(key: K, val: GenerateReportInput[K]) =>
    onChange({ ...values, [key]: val });

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm flex flex-col gap-5">
      <div>
        <p className="text-base font-semibold text-foreground">Report Filters</p>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your report before generating</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Year */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-year">
            Year <span className="text-destructive">*</span>
          </Label>
          <Input
            id="report-year"
            type="number"
            min={2020}
            max={2099}
            value={values.year}
            onChange={(e) => set("year", parseInt(e.target.value, 10) || new Date().getFullYear())}
          />
        </div>

        {/* College */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-college">College</Label>
          <Select
            value={values.collegeId ?? "all"}
            onValueChange={(v) => set("collegeId", v === "all" ? undefined : v)}
          >
            <SelectTrigger id="report-college">
              <SelectValue placeholder="All Colleges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {colleges.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-1.5">
          <Label>Format <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((opt) => {
              const selected = values.format === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("format", opt.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                    selected
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button onClick={onGenerate} disabled={isLoading} className="self-start">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
        ) : (
          "Generate Report"
        )}
      </Button>
    </div>
  );
}

