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
