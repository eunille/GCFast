// lib/supabase/client.ts
// Layer 2 — DATA: Supabase browser client (for client components)

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for use in repositories
export const supabase = createClient();
