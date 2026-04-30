// features/reports/components/ReportFilters/ReportFilters.tsx
// Layer 4 — PRESENTATIONAL: Date range, college, and format controls for report generation

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
import { Loader2 } from "lucide-react";
import type { GenerateReportInput } from "@/lib/models";

interface Props {
  values: GenerateReportInput;
  onChange: (v: GenerateReportInput) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function ReportFilters({ values, onChange, onGenerate, isLoading }: Props) {
  const { data: colleges = [] } = useColleges();

  const set = <K extends keyof GenerateReportInput>(key: K, val: GenerateReportInput[K]) =>
    onChange({ ...values, [key]: val });

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Report type */}
      <div className="flex flex-col gap-1.5 min-w-50">
        <Label htmlFor="report-type">Report Type</Label>
        <Select
          value={values.reportType}
          onValueChange={(v) => set("reportType", v as GenerateReportInput["reportType"])}
        >
          <SelectTrigger id="report-type" className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="payment_summary">Payment Summary Report</SelectItem>
            <SelectItem value="outstanding_balance">Outstanding Balance Report</SelectItem>
            <SelectItem value="membership_status">Membership Status Report</SelectItem>
            <SelectItem value="monthly_collection">Monthly Collection Report</SelectItem>
            <SelectItem value="member_standing">Member Standing Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* College filter */}
      <div className="flex flex-col gap-1.5 min-w-45">
        <Label htmlFor="report-college">College</Label>
        <Select
          value={values.collegeId ?? "all"}
          onValueChange={(v) => set("collegeId", v === "all" ? undefined : v)}
        >
          <SelectTrigger id="report-college" className="bg-white">
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

      {/* Start date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-start">Start Date</Label>
        <Input
          id="report-start"
          type="date"
          className="bg-white"
          value={values.startDate}
          onChange={(e) => set("startDate", e.target.value)}
        />
      </div>

      {/* End date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-end">End Date</Label>
        <Input
          id="report-end"
          type="date"
          className="bg-white"
          value={values.endDate}
          onChange={(e) => set("endDate", e.target.value)}
        />
      </div>

      {/* Generate button */}
      <Button onClick={onGenerate} disabled={isLoading} className="self-end">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
        ) : (
          "Generate Report"
        )}
      </Button>
    </div>
  );
}

