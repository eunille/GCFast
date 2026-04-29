// features/reports/types/report.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/report.models.ts

export type {
  GenerateReportInput,
  ReportMemberRow,
  ReportData,
  ReportFormat,
} from "@/lib/models";
export type ReportType =
  | "payment_summary"
  | "collection_by_college"
  | "member_payments";

export interface ReportFilters {
  reportType: ReportType;
  collegeId?: string;
  startDate: string;
  endDate: string;
}

export interface PaymentSummaryReport {
  totalCollected: number;
  totalCollectedChangePercent: number;
  outstanding: number;
  outstandingMemberCount: number;
  membersPaid: number;
  membersPaidPercent: number;
  averageCollectionPerMember: number;
  period: {
    startDate: string;
    endDate: string;
  };
}