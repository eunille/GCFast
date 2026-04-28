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
import { createServerClient } from "@supabase/ssr";
import { errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import type { User } from "@supabase/supabase-js";

/**
 * Authenticate the request via Supabase JWT.
 *
 * Supports two auth strategies (checked in order):
 *  1. Authorization: Bearer <access_token> — for Postman / API clients / mobile
 *  2. Cookie-based session — for browser clients (standard SSR flow)
 *
 * @param req - Incoming request object
 * @returns User object if authenticated, or 401 Response if not
 */
export async function withAuth(req: Request): Promise<User | Response> {
  // ── Strategy 1: Bearer token (Postman / API clients) ────────────────────
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      // Build a lightweight client that authenticates via the provided JWT.
      // Cookie adapter is a no-op — we only need getUser() here.
      const supabaseWithToken = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
          cookies: { getAll: () => [], setAll: () => {} },
        }
      );
      const { data: { user }, error } = await supabaseWithToken.auth.getUser(token);
      if (!error && user) return user;
    }
  }

  // ── Strategy 2: Cookie-based session (browser / SSR) ────────────────────
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
