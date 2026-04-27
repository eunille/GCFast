/**
 * Authentication Middleware
 * 
 * Validates JWT from Supabase auth and returns authenticated user.
 * Use in every API route that requires authentication.
 * 
 * Returns:
 * - `User` object if authenticated
 * - `Response` with 401 error if not authenticated
 * 
 * Usage:
 * ```typescript
 * export const GET = apiHandler(async (req: Request) => {
 *   const authResult = await withAuth(req);
 *   if (authResult instanceof Response) return authResult;
 *   
 *   const user = authResult; // Type: User
 *   // ... route logic
 * });
 * ```
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import type { User } from "@supabase/supabase-js";

/**
 * Authenticate the request via Supabase JWT
 * 
 * @param req - Incoming request object
 * @returns User object if authenticated, or 401 Response if not
 */
export async function withAuth(req: Request): Promise<User | Response> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(
      ErrorCodes.UNAUTHORIZED,
      "Authentication required",
      401
    );
  }

  return user;
}
