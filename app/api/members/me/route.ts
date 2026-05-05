// app/api/members/me/route.ts
// GET  — returns the authenticated member's own record
// PATCH — allows a member to update their own limited fields (fullName, employeeId, notes)

import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withApproval } from "@/lib/middleware/withApproval";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { selfUpdateMemberSchema } from "@/features/members/types/member.schemas";
import { mapApiMemberFromDb } from "@/features/members/repositories/member.mapper";

const MEMBER_SELECT = "*, colleges(name, code)";

// ─── GET /api/members/me ──────────────────────────────────────────────────────

export const GET = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const approvalResult = await withApproval(authResult, req);
  if (approvalResult !== null) return approvalResult;

  const supabase = await createSupabaseServer(req);

  // Strategy 1: look up by profile_id (fast path — already linked)
  let { data, error } = await supabase
    .from("members")
    .select(MEMBER_SELECT)
    .eq("profile_id", authResult.id)
    .maybeSingle();

  // Strategy 2: email fallback (account registered before treasurer linked it)
  if (!data && authResult.email) {
    const { data: byEmail } = await supabase
      .from("members")
      .select(MEMBER_SELECT)
      .eq("email", authResult.email)
      .eq("is_active", true)
      .maybeSingle();

    if (byEmail) {
      data = byEmail;
      error = null;
      // Auto-link so future lookups use the fast path
      const adminClient = getSupabaseAdmin();
      await adminClient
        .from("members")
        .update({ profile_id: authResult.id })
        .eq("id", (byEmail as Record<string, unknown>).id as string);
    }
  }

  if (error || !data) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      "No member record linked to this account",
      404
    );
  }

  return successResponse(mapApiMemberFromDb(data as Record<string, unknown>));
});

// ─── PATCH /api/members/me ────────────────────────────────────────────────────

export const PATCH = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const approvalResult = await withApproval(authResult, req);
  if (approvalResult !== null) return approvalResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(selfUpdateMemberSchema, body);
  if (!parsed.success) return parsed.response;

  const supabase = await createSupabaseServer(req);

  // Look up the member record owned by this user (uses user token — verifies ownership)
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("profile_id", authResult.id)
    .single();

  if (!existing) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Member record not found", 404);
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.fullName   !== undefined) updatePayload.full_name   = parsed.data.fullName;
  if (parsed.data.employeeId !== undefined) updatePayload.employee_id = parsed.data.employeeId;
  if (parsed.data.notes      !== undefined) updatePayload.notes       = parsed.data.notes;
  if (parsed.data.collegeId  !== undefined) updatePayload.college_id  = parsed.data.collegeId;

  if (Object.keys(updatePayload).length === 0) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "No fields to update", 400);
  }

  // Use admin client for the write — member UPDATE RLS only allows treasurer role
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("members")
    .update(updatePayload)
    .eq("id", existing.id)
    .select(MEMBER_SELECT)
    .single();

  if (error) throw new Error(error.message);

  return successResponse(mapApiMemberFromDb(data as Record<string, unknown>));
});
