/**
 * Approval Middleware
 *
 * Blocks pending/rejected member accounts from accessing member-only API routes.
 * Must be called AFTER withAuth (requires authenticated user with user.id).
 *
 * Usage:
 * ```typescript
 * export const GET = apiHandler(async (req: Request) => {
 *   const authResult = await withAuth(req);
 *   if (authResult instanceof Response) return authResult;
 *
 *   const approvalResult = await withApproval(authResult, req);
 *   if (approvalResult instanceof Response) return approvalResult;
 *
 *   // User is authenticated AND account is active
 * });
 * ```
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import type { User } from "@supabase/supabase-js";

export async function withApproval(user: User, req?: Request): Promise<null | Response> {
  const supabase = await createSupabaseServer(req);

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .single();

  if (!profile) return null; // no profile row → let downstream handle it

  if (profile.account_status === "pending") {
    return errorResponse(
      ErrorCodes.FORBIDDEN,
      "Your account is pending approval by the Treasurer.",
      403
    );
  }

  if (profile.account_status === "rejected") {
    return errorResponse(
      ErrorCodes.FORBIDDEN,
      "Your account has been rejected. Please contact the Treasurer.",
      403
    );
  }

  return null; // account is active — proceed
}
