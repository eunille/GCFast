// features/reports/components/ReportFilters/ReportFilters.tsx
// Layer 4 — PRESENTATIONAL: Filter controls for report generation
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportFilters, ReportType } from "../../types/report.types";

type CollegeOption = {
  id: string;
  code: string;
};

interface Props {
  colleges: CollegeOption[];
  initialFilters?: Partial<ReportFilters>;
  isGenerating?: boolean;
  onGenerate: (filters: ReportFilters) => void;
}

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: "payment_summary", label: "Payment Summary Report" },
  { value: "collection_by_college", label: "Collection by College" },
  { value: "member_payments", label: "Member Payments Report" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ReportFilters({
  colleges,
  initialFilters,
  isGenerating = false,
  onGenerate,
}: Props) {
  const [reportType, setReportType] = useState<ReportType>(
    initialFilters?.reportType ?? "payment_summary",
  );
  const [collegeId, setCollegeId] = useState(
    initialFilters?.collegeId ?? "all",
  );
  const [startDate, setStartDate] = useState(
    initialFilters?.startDate ?? todayISO(),
  );
  const [endDate, setEndDate] = useState(initialFilters?.endDate ?? todayISO());

  useEffect(() => {
    onGenerate({
      reportType,
      collegeId: collegeId === "all" ? undefined : collegeId,
      startDate,
      endDate,
    });
  }, [reportType, collegeId, startDate, endDate, onGenerate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onGenerate({
      reportType,
      collegeId: collegeId === "all" ? undefined : collegeId,
      startDate,
      endDate,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 "
    >
      <div className="w-full flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-4">
          <div className="grid gap-1.5">
            <Label
              htmlFor="reportType"
              className="text-xs font-medium text-muted-foreground"
            >
              Report Type
            </Label>
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as ReportType)}
            >
              <SelectTrigger id="reportType" className="w-55">
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="collegeId"
              className="text-xs font-medium text-muted-foreground"
            >
              College
            </Label>
            <Select value={collegeId} onValueChange={setCollegeId}>
              <SelectTrigger id="collegeId" className="w-45">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="startDate"
              className="text-xs font-medium text-muted-foreground"
            >
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-45"
            />
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="endDate"
              className="text-xs font-medium text-muted-foreground"
            >
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-45"
            />
          </div>
        </div>

        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </form>
  );
}
