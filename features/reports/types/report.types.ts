// features/reports/types/report.types.ts
// Layer 1 — DOMAIN: Report filter and result types

export type ReportType = "PAYMENT_SUMMARY" | "OUTSTANDING_BALANCE" | "COLLECTION_REPORT";

export interface ReportFilter {
  type: ReportType;
  collegeId?: string;
  yearRef: number;
  monthRef?: number;
}

export interface ReportRow {
  memberId: string;
  memberName: string;
  college: string;
  totalPaid: number;
  outstandingBalance: number;
  monthsPaid: number[];
  membershipFeePaid: boolean;
}
