import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

export const POST = apiHandler(async (req: Request) => {
  // 1. Authenticate — must have a valid session to sign out
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Sign out — invalidates the session server-side
  const supabase = await createSupabaseServer(req);
  const { error } = await supabase.auth.signOut();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, "Sign out failed", 500);
  }

  return successResponse({ message: "Signed out successfully" });
});
