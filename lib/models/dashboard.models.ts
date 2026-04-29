// lib/models/dashboard.models.ts
// Source of truth: API_MODELS.md — "Dashboard Models"

import type { MemberType, PaymentStatus } from "./shared.models";

/** GET /api/dashboard/treasurer — treasurer only */
export interface TreasurerDashboard {
  totalMembers: number;
  totalCollected: number;
  membersWithBalance: number;
  membersComplete: number;
  collectionByCollege: {
    collegeId: string;
    collegeName: string;
    total: number;
    memberCount: number;
  }[];
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
