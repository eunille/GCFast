/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Enforces role requirements for API routes.
 * Must be called AFTER withAuth (requires authenticated user).
 * 
 * SECURITY: Always reads role from database with explicit user.id filter.
 * Never relies solely on RLS to identify the current user.
 *
 * Returns:
 * - `{ success: true, profile }` if user has required role
 * - `{ success: false, response }` if user lacks required role (403)
 * 
 * Usage:
 * ```typescript
 * export const GET = apiHandler(async (req: Request) => {
 *   const authResult = await withAuth(req);
 *   if (authResult instanceof Response) return authResult;
 *   
 *   const roleResult = await withRole(authResult, "treasurer");
 *   if (!roleResult.success) return roleResult.response;
 *   
 *   // User is authenticated AND has treasurer role
 *   // ... route logic
 * });
 * ```
 */

import { createSupabaseServer } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import type { User } from "@supabase/supabase-js";

export type UserRole = "treasurer" | "member";

interface RoleCheckSuccess {
  success: true;
  profile: { role: UserRole };
}

interface RoleCheckFailure {
  success: false;
  response: Response;
}

/**
 * Verify the authenticated user has the required role
 * 
 * SECURITY: Explicitly filters by user.id for defense-in-depth.
 * This prevents auth bypass if RLS is misconfigured during testing/migrations.
 * 
 * @param user - Authenticated user from withAuth()
 * @param requiredRole - The role required to access this route
 * @returns Success with profile or failure with 403 Response
 */
export async function withRole(
  user: User,
  requiredRole: UserRole,
  req?: Request
): Promise<RoleCheckSuccess | RoleCheckFailure> {
  const supabase = await createSupabaseServer(req);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id) // Explicit user ID filter — defense-in-depth
    .single();

  if (error || !profile) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        "Unable to verify permissions",
        403
      ),
    };
  }

  if (profile.role !== requiredRole) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        `This action requires ${requiredRole} role`,
        403
      ),
    };
  }

  return { success: true, profile: { role: profile.role as UserRole } };
}
