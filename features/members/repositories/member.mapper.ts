// features/members/repositories/member.mapper.ts
// Layer 2 — DATA: Maps raw Supabase snake_case rows → API-canonical Member type
// Only used server-side (API routes). Client-side receives JSON directly from API routes.

import type { Member } from "@/lib/models";

/** Used by server-side API route handlers — maps Supabase row to canonical Member */
export function mapApiMemberFromDb(row: Record<string, unknown>): Member {
  const colleges = row.colleges as { name?: string; code?: string } | null | undefined;

  return {
    id:           row.id as string,
    profileId:    (row.profile_id as string | null) ?? null,
    collegeId:    row.college_id as string,
    collegeName:  colleges?.name,
    collegeCode:  colleges?.code,
    employeeId:   row.employee_id as string | undefined,
    fullName:     row.full_name as string,
    email:        row.email as string,
    memberType:   row.member_type as Member["memberType"],
    joinedAt:     row.joined_at as string | undefined,
    isActive:     row.is_active as boolean,
    notes:        row.notes as string | undefined,
    createdAt:    row.created_at as string,
    updatedAt:    row.updated_at as string,
  };
}

// Legacy alias — kept so existing server-side routes don't break.
export const mapMemberFromDb = mapApiMemberFromDb;

