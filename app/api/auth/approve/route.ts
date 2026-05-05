// app/api/auth/approve/route.ts
// PATCH — Treasurer only. Approve or reject a pending member auth account.

import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const approveSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  action: z.enum(["approve", "reject"]),
});

export const PATCH = apiHandler(async (req: Request) => {
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

  const parsed = validate(approveSchema, body);
  if (!parsed.success) return parsed.response;

  const { profileId, action } = parsed.data;
  const newStatus = action === "approve" ? "active" : "rejected";

  const supabaseAdmin = getSupabaseAdmin();

  // Update profiles.account_status
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ account_status: newStatus })
    .eq("id", profileId);

  if (profileError) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, profileError.message, 500);
  }

  // Fetch the updated profile to return current state
  const { data: updated } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, account_status")
    .eq("id", profileId)
    .single();

  return successResponse({
    profileId,
    action,
    accountStatus: newStatus,
    fullName: updated?.full_name ?? null,
    email: updated?.email ?? null,
  });
});
