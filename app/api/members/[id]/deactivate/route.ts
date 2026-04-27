import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

const uuidSchema = z.string().uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── PATCH /api/members/[id]/deactivate ───────────────────────────────────────

export const PATCH = apiHandler(async (req: Request, ctx: unknown) => {
  const { id } = await (ctx as RouteContext).params;

  const idCheck = uuidSchema.safeParse(id);
  if (!idCheck.success) {
    return errorResponse(ErrorCodes.INVALID_UUID, "Invalid member ID", 400);
  }

  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;

  const supabase = await createSupabaseServer();

  // Verify member exists and is currently active
  const { data: existing, error: fetchError } = await supabase
    .from("members")
    .select("id, is_active")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Member not found", 404);
  }

  if (!existing.is_active) {
    return errorResponse(
      ErrorCodes.CONFLICT,
      "Member is already deactivated",
      409
    );
  }

  // Soft delete — never hard delete members (payment records must stay intact)
  const { error } = await supabase
    .from("members")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);

  return successResponse({ message: "Member deactivated successfully" });
});
