/**
 * Supabase Admin Client (Service Role)
 *
 * WARNING: This client bypasses Row Level Security (RLS).
 *
 * ONLY use for trusted server-side operations:
 * - Inviting new users (auth.admin.inviteUserByEmail)
 * - Bulk administrative operations
 * - Server-side migrations
 *
 * NEVER import this file in:
 * - Client components (/app directory)
 * - Any code that runs in the browser
 *
 * Restrict usage to:
 * - API routes (/app/api directory only)
 * - Server-side utilities
 *
 * Usage: call `getSupabaseAdmin()` — lazily initializes on first use.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;

/**
 * Returns the Supabase admin client (lazily initialized).
 * Env vars are validated at call time — not at module load.
 * This prevents build failures when env vars are absent in CI/preview builds.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serviceKey) {
    throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }

  _adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
