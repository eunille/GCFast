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
