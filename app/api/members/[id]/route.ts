import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { apiUpdateMemberSchema } from "@/features/members/types/member.schemas";
import { mapApiMemberFromDb } from "@/features/members/repositories/member.mapper";

const uuidSchema = z.string().uuid();
const MEMBER_SELECT = "*, colleges(name, code), profiles!members_profile_id_fkey(account_status)";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── GET /api/members/[id] ────────────────────────────────────────────────────

export const GET = apiHandler(async (req: Request, ctx: unknown) => {
  const { id } = await (ctx as RouteContext).params;

  const idCheck = uuidSchema.safeParse(id);
  if (!idCheck.success) {
    return errorResponse(ErrorCodes.INVALID_UUID, "Invalid member ID", 400);
  }

  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const supabase = await createSupabaseServer(req);

  // Authorization BEFORE data access — check role and ownership first
  // profiles has no member_id column; FK is members.profile_id → profiles.id
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authResult.id)
    .single();

  const isTreasurer = profile?.role === "treasurer";

  if (!isTreasurer) {
    // Non-treasurer: only allow access to own member record via profile_id FK
    const { data: memberCheck } = await supabase
      .from("members")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (memberCheck?.profile_id !== authResult.id) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Access denied", 403);
    }
  }

  // Only fetch member data once authorization is confirmed
  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Member not found", 404);
  }

  return successResponse(mapApiMemberFromDb(data as Record<string, unknown>));
});

// ─── PATCH /api/members/[id] ──────────────────────────────────────────────────

export const PATCH = apiHandler(async (req: Request, ctx: unknown) => {
  const { id } = await (ctx as RouteContext).params;

  const idCheck = uuidSchema.safeParse(id);
  if (!idCheck.success) {
    return errorResponse(ErrorCodes.INVALID_UUID, "Invalid member ID", 400);
  }

  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(apiUpdateMemberSchema, body);
  if (!parsed.success) return parsed.response;

  const supabase = await createSupabaseServer(req);

  // Member existence check
  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("id", id);

  if (!memberCount || memberCount === 0) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Member not found", 404);
  }

  // Email uniqueness check (only if email is changing)
  if (parsed.data.email) {
    const { count: emailCount } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("email", parsed.data.email)
      .neq("id", id);

    if (emailCount && emailCount > 0) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        "A member with this email already exists",
        409
      );
    }
  }

  const { fullName, email, collegeId, memberType, employeeId, joinedAt, notes } = parsed.data;

  const updatePayload: Record<string, unknown> = {};
  if (fullName !== undefined) updatePayload.full_name = fullName;
  if (email !== undefined) updatePayload.email = email;
  if (collegeId !== undefined) updatePayload.college_id = collegeId;
  if (memberType !== undefined) updatePayload.member_type = memberType;
  if (employeeId !== undefined) updatePayload.employee_id = employeeId;
  if (joinedAt !== undefined) updatePayload.joined_at = joinedAt;
  if (notes !== undefined) updatePayload.notes = notes;

  const { data, error } = await supabase
    .from("members")
    .update(updatePayload)
    .eq("id", id)
    .select(MEMBER_SELECT)
    .single();

  if (error) throw new Error(error.message);

  return successResponse(mapApiMemberFromDb(data as Record<string, unknown>));
});
