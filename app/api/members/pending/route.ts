// app/api/members/pending/route.ts
// GET — Treasurer only. Returns all profiles with account_status = 'pending' and role = 'member'.
// These accounts self-registered but have not yet been approved.

import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const GET = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("account_status", "pending")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  const items = (data ?? []).map((row) => ({
    profileId: row.id,
    fullName: row.full_name ?? null,
    email: row.email ?? null,
    registeredAt: row.created_at ?? null,
  }));

  return successResponse(items);
});
