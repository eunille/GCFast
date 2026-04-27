// features/members/types/member.types.ts
// Layer 1 — DOMAIN: Pure TypeScript. Zero framework dependencies.

export type MemberRole = "MEMBER" | "TREASURER" | "ADMIN";

export type MemberStatus = "ACTIVE" | "INACTIVE";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  collegeId: string;
  collegeName: string;
  role: MemberRole;
  status: MemberStatus;
  createdAt: Date;
}

export interface MemberFilter {
  collegeId?: string;
  status?: MemberStatus;
  search?: string;
}
