// lib/models/member.models.ts
// Source of truth: API_MODELS.md — "Member Models"

import type { MemberType, AccountStatus } from "./shared.models";

/** GET /api/members, GET /api/members/:id, POST /api/members, PATCH /api/members/:id */
export interface Member {
  id: string;
  profileId: string | null;
  collegeId: string | null;   // null for self-registered pending members
  collegeName?: string;
  collegeCode?: string;
  employeeId?: string;
  fullName: string;
  email: string;
  memberType: MemberType;
  joinedAt?: string;       // ISO Date YYYY-MM-DD
  isActive: boolean;
  notes?: string;
  /** Populated when a linked auth account exists */
  accountStatus?: AccountStatus;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

/** POST /api/members body */
export interface CreateMemberInput {
  fullName: string;
  email: string;
  /** When provided, an auth account is created so the member can log in immediately. */
  password?: string;
  collegeId: string;
  memberType: MemberType;
  employeeId?: string;
  joinedAt?: string;       // ISO Date YYYY-MM-DD
  notes?: string;
}

/** PATCH /api/members/:id body — all fields optional */
export type UpdateMemberInput = Partial<CreateMemberInput>;

/** Query params for GET /api/members */
export interface MemberListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: "full_name" | "joined_at" | "college_name";
  sortOrder?: "asc" | "desc";
  search?: string;
  collegeId?: string;
  memberType?: MemberType;
  isActive?: boolean;
  /** Filter by linked account status. "pending" shows only pending-approval members. */
  accountStatus?: "pending" | "active" | "inactive";
}
