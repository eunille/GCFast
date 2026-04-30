// lib/models/report.models.ts
// Source of truth: API_MODELS.md — "Report Models"

import type { ReportFormat } from "./shared.models";

export type ReportType =
  | "payment_summary"
  | "outstanding_balance"
  | "membership_status"
  | "monthly_collection"
  | "member_standing";

/** POST /api/reports/generate body */
export interface GenerateReportInput {
  reportType: ReportType;
  startDate: string;
  endDate: string;
  format: ReportFormat;
  collegeId?: string;
}

// ─── payment_summary ───────────────────────────────────────────────────

export interface CollegeBreakdownRow {
  collegeId: string;
  collegeName: string;
  totalMembers: number;
  membersPaid: number;
  totalCollected: number;
  outstanding: number;
  collectionRate: number;
}

export interface PaymentSummaryReport {
  reportType: "payment_summary";
  generatedAt: string;
  startDate: string;
  endDate: string;
  collegeScope: string;
  totalCollected: number;
  outstanding: number;
  totalMembers: number;
  membersPaid: number;
  membersPaidPercent: number;
  avgCollectionPerMember: number;
  breakdown: CollegeBreakdownRow[];
}

// ─── outstanding_balance ────────────────────────────────────────────

export interface OutstandingMemberRow {
  memberId: string;
  fullName: string;
  collegeName: string;
  memberType: string;
  outstandingBalance: number;
  periodsExpected: number;
  periodsPaid: number;
}

export interface OutstandingBalanceReport {
  reportType: "outstanding_balance";
  generatedAt: string;
  startDate: string;
  endDate: string;
  collegeScope: string;
  totalOutstanding: number;
  membersWithBalance: number;
  totalMembers: number;
  members: OutstandingMemberRow[];
}

// ─── membership_status ──────────────────────────────────────────────

export interface MembershipStatusRow {
  collegeId: string;
  collegeName: string;
  totalMembers: number;
  complete: number;
  hasBalance: number;
  completePercent: number;
}

export interface MembershipStatusReport {
  reportType: "membership_status";
  generatedAt: string;
  startDate: string;
  endDate: string;
  collegeScope: string;
  totalMembers: number;
  totalComplete: number;
  totalHasBalance: number;
  overallCompletePercent: number;
  breakdown: MembershipStatusRow[];
}

// ─── monthly_collection ─────────────────────────────────────────────

export interface MonthlyCollectionRow {
  yearMonth: string;
  label: string;
  totalCollected: number;
  paymentCount: number;
  uniqueMembers: number;
}

export interface MonthlyCollectionReport {
  reportType: "monthly_collection";
  generatedAt: string;
  startDate: string;
  endDate: string;
  collegeScope: string;
  totalCollected: number;
  months: MonthlyCollectionRow[];
}

// ─── member_standing ───────────────────────────────────────────────

export interface MemberStandingRow {
  memberId: string;
  fullName: string;
  collegeName: string;
  memberType: string;
  membershipFeePaid: boolean;
  periodsPaid: number;
  periodsExpected: number;
  outstandingBalance: number;
  status: string;
}

export interface MemberStandingReport {
  reportType: "member_standing";
  generatedAt: string;
  startDate: string;
  endDate: string;
  collegeScope: string;
  totalMembers: number;
  totalComplete: number;
  totalHasBalance: number;
  members: MemberStandingRow[];
}

// ─── Union ─────────────────────────────────────────────────────────────────

export type ReportResult =
  | PaymentSummaryReport
  | OutstandingBalanceReport
  | MembershipStatusReport
  | MonthlyCollectionReport
  | MemberStandingReport;

/** @deprecated alias — prefer PaymentSummaryReport */
export type ReportData = PaymentSummaryReport;
/** @deprecated alias — prefer CollegeBreakdownRow */
export type ReportMemberRow = CollegeBreakdownRow;
