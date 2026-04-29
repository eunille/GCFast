// lib/models/report.models.ts
// Source of truth: API_MODELS.md — "Report Models"

import type { ReportFormat, PaymentStatus } from "./shared.models";

/** POST /api/reports/generate body */
export interface GenerateReportInput {
  year: number;
  format: ReportFormat;
  collegeId?: string;
}

/** Single member row inside ReportData (format = "json") */
export interface ReportMemberRow {
  memberId: string;
  fullName: string;
  collegeName: string;
  memberType: string;
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  outstandingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string | null; // ISO Date YYYY-MM-DD
}

/** Response when format = "json" from POST /api/reports/generate */
export interface ReportData {
  generatedAt: string;
  year: number;
  college: string;
  totalMembers: number;
  totalCollected: number;
  members: ReportMemberRow[];
}
