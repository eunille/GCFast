// features/payments/types/dashboard.types.ts
// Layer 1 — DOMAIN: Types for dashboard summary statistics

export interface DashboardStats {
  totalMembers: number;
  membersPaidInFull: number;
  membersWithBalance: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number; // 0–100 percentage
}

export interface CollegeCollection {
  collegeId: string;
  collegeName: string;
  total: number;
  memberCount: number;
}

export interface TreasurerDashboard {
  totalMembers: number;
  totalCollected: number;
  membersWithBalance: number;
  membersComplete: number;
  collectionByCollege: CollegeCollection[];
}
