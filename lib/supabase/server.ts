// lib/supabase/server.ts
// Layer 2 — DATA: Supabase server client (for Server Components and Server Actions)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for server-side usage (API routes, Server Components, Server Actions).
 *
 * When an optional `req` is passed and contains an `Authorization: Bearer <token>` header,
 * the client is created with that token so RLS runs in the authenticated user's context.
 * This is required for API clients (Postman, mobile) that cannot use cookie-based sessions.
 *
 * When called without `req` (or without a Bearer token), falls back to cookie-based session.
 */
export async function createSupabaseServer(req?: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  // When a Bearer token is present, create a token-aware client so RLS works correctly.
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        return createServerClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          cookies: { getAll: () => [], setAll: () => {} },
        });
      }
    }
  }

  // Fallback: cookie-based session (browser / SSR).
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

