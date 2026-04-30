// features/reports/types/report.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/report.models.ts

export type {
  GenerateReportInput, ReportType, ReportFormat,
  CollegeBreakdownRow, PaymentSummaryReport,
  OutstandingMemberRow, OutstandingBalanceReport,
  MembershipStatusRow, MembershipStatusReport,
  MonthlyCollectionRow, MonthlyCollectionReport,
  MemberStandingRow, MemberStandingReport,
  ReportResult, ReportData, ReportMemberRow,
} from "@/lib/models";
