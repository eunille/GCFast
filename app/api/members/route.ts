import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { toRange, buildMeta } from "@/lib/utils/pagination";
import { applySearch, applySorting } from "@/lib/utils/query-builder";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  apiMemberFilterSchema,
  apiCreateMemberSchema,
} from "@/features/members/types/member.schemas";
import { mapApiMemberFromDb } from "@/features/members/repositories/member.mapper";

const ALLOWED_SORT_FIELDS = ["full_name", "joined_at", "college_name"] as const;
const MEMBER_SELECT = "*, colleges(name, code)";

// ─── GET /api/members ─────────────────────────────────────────────────────────

export const GET = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // Treasurer-only: member list contains full details (email, employee ID, notes)
  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;

  const { searchParams } = new URL(req.url);
  const parsed = validate(apiMemberFilterSchema, Object.fromEntries(searchParams));
  if (!parsed.success) return parsed.response;

  const { page, pageSize, sortBy, sortOrder, search, isActive, ...filters } = parsed.data;
  const { from, to } = toRange({ page, pageSize });

  const supabase = await createSupabaseServer();
  let query = supabase
    .from("members")
    .select(MEMBER_SELECT, { count: "exact" })
    .range(from, to)
    .eq("is_active", isActive ?? true); // default: active only

  if (filters.collegeId) query = query.eq("college_id", filters.collegeId);
  if (filters.memberType) query = query.eq("member_type", filters.memberType);
  if (search) query = applySearch(query, search, ["full_name", "email"]);

  query = applySorting(query, sortBy ?? "full_name", sortOrder, [
    ...ALLOWED_SORT_FIELDS,
  ]);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return successResponse(
    (data ?? []).map(mapApiMemberFromDb),
    buildMeta(count ?? 0, { page, pageSize })
  );
});

// ─── POST /api/members ────────────────────────────────────────────────────────

export const POST = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(apiCreateMemberSchema, body);
  if (!parsed.success) return parsed.response;

  const supabase = await createSupabaseServer();
  const { fullName, email, collegeId, memberType, employeeId, joinedAt, notes } = parsed.data;

  // Email uniqueness check
  const { count: emailCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("email", email);

  if (emailCount && emailCount > 0) {
    return errorResponse(ErrorCodes.CONFLICT, "A member with this email already exists", 409);
  }

  // College existence check
  const { count: collegeCount } = await supabase
    .from("colleges")
    .select("id", { count: "exact", head: true })
    .eq("id", collegeId);

  if (!collegeCount || collegeCount === 0) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "College not found", 400);
  }

  const { data, error } = await supabase
    .from("members")
    .insert({
      full_name: fullName,
      email,
      college_id: collegeId,
      member_type: memberType,
      employee_id: employeeId,
      joined_at: joinedAt,
      notes,
      is_active: true,
      created_by: authResult.id,
    })
    .select(MEMBER_SELECT)
    .single();

  if (error) throw new Error(error.message);

  return successResponse(mapApiMemberFromDb(data as Record<string, unknown>), undefined, 201);
});
