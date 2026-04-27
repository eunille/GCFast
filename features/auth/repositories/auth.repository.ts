// features/auth/repositories/auth.repository.ts
// Layer 2 — DATA: Only layer that calls Supabase auth. No JSX. No React hooks.

import { supabase } from "@/lib/supabase/client";
import type { AuthUser } from "../types/auth.types";

function mapSessionUser(user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>["user"]): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    role: (user.user_metadata?.role as AuthUser["role"]) ?? "MEMBER",
    memberId: user.user_metadata?.member_id ?? null,
  };
}

export const authRepository = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(error?.message ?? "Sign in failed");
    return mapSessionUser(data.session.user);
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return mapSessionUser(session.user);
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(mapSessionUser(session.user));
      } else {
        callback(null);
      }
    });
    return () => subscription.unsubscribe();
  },
};
