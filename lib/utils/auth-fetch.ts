// lib/utils/auth-fetch.ts
// Utility: wraps fetch with Authorization: Bearer <token> from the active session.
// Use in client-side repositories that call our own API routes.

import { supabase } from "@/lib/supabase/client";

export async function authFetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
