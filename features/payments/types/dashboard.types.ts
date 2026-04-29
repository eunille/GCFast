// features/payments/types/dashboard.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/dashboard.models.ts

export type { TreasurerDashboard, MemberDashboard } from "@/lib/models";

// CollegeCollection is inlined in TreasurerDashboard per the API model.
// Exported here as a convenience alias for components that need it standalone.
import type { TreasurerDashboard } from "@/lib/models";
export type CollegeCollection = TreasurerDashboard["collectionByCollege"][number];

// DashboardStats is a legacy derived type used by useDashboardStats — not an API model.
// Kept here for backward compatibility with that hook.
export interface DashboardStats {
  totalMembers: number;
  membersPaidInFull: number;
  membersWithBalance: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}
