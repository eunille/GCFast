// features/members/repositories/member.mapper.ts
// Layer 2 — DATA: Maps raw Supabase snake_case rows → clean camelCase domain types

import type { Member } from "../types/member.types";

export function mapMemberFromDb(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    fullName: `${row.first_name} ${row.last_name}`,
    email: row.email as string,
    collegeId: row.college_id as string,
    collegeName: row.college_name as string,
    role: row.role as Member["role"],
    status: row.status as Member["status"],
    createdAt: new Date(row.created_at as string),
  };
}

// ─── API mapper — GFAST canonical model (used by server-side API routes) ─────

export interface ApiMember {
  id: string;
  profileId: string | null;
  collegeId: string;
  collegeName?: string;
  collegeCode?: string;
  employeeId?: string;
  fullName: string;
  email: string;
  memberType: "FULL_TIME" | "ASSOCIATE";
  joinedAt?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapApiMemberFromDb(row: Record<string, unknown>): ApiMember {
  const colleges = row.colleges as
    | { name?: string; code?: string }
    | null
    | undefined;

  return {
    id: row.id as string,
    profileId: (row.profile_id as string | null) ?? null,
    collegeId: row.college_id as string,
    collegeName: colleges?.name,
    collegeCode: colleges?.code,
    employeeId: row.employee_id as string | undefined,
    fullName: row.full_name as string,
    email: row.email as string,
    memberType: row.member_type as "FULL_TIME" | "ASSOCIATE",
    joinedAt: row.joined_at as string | undefined,
    isActive: row.is_active as boolean,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
