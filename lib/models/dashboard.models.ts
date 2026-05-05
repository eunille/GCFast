// lib/models/dashboard.models.ts
// Source of truth: API_MODELS.md — "Dashboard Models"

import type { MemberType, PaymentStatus } from "./shared.models";

export interface MonthlyTrendPoint {
  /** "YYYY-MM" */
  yearMonth: string;
  /** Display label e.g. "Jan", "Feb" */
  label: string;
  totalCollected: number;
}

export interface CollegeDistribution {
  collegeId: string | null;
  collegeName: string | null;
  /** Total amount collected from this college */
  total: number;
  /** Number of active members in this college */
  memberCount: number;
  /** 0-100 integer percentage of total collected */
  percent: number;
}

/** GET /api/dashboard/treasurer — treasurer only */
export interface TreasurerDashboard {
  totalMembers: number;
  totalCollected: number;
  membersWithBalance: number;
  membersComplete: number;
  /** Month-over-month collected change (this month − last month), null if no prior data */
  collectedChange: number | null;
  /** Month-over-month collection rate change in percentage points */
  collectionRateChange: number | null;
  /** Number of new members this month */
  newMembersThisMonth: number;
  /** Outstanding amount change vs previous month */
  outstandingChange: number | null;
  /** Monthly trend for bar chart — last 6 months, oldest first */
  monthlyTrend: MonthlyTrendPoint[];
  /** Per-college distribution for pie chart */
  collectionByCollege: CollegeDistribution[];
}

/** GET /api/dashboard/member — returns caller's own record */
export interface MemberDashboard {
  memberId: string;
  fullName: string;
  college: string | null;
  memberType: MemberType;
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  monthsPaid: number[];
  outstandingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string | null; // ISO Date YYYY-MM-DD
}


/** GET /api/dashboard/member — returns caller's own record */
export interface MemberDashboard {
  memberId: string;
  fullName: string;
  college: string | null;
  memberType: MemberType;
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  monthsPaid: number[];
  outstandingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string | null; // ISO Date YYYY-MM-DD
}
