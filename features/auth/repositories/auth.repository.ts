// features/auth/repositories/auth.repository.ts
// Layer 2 — DATA: Only layer that calls Supabase auth. No JSX. No React hooks.

import { supabase } from "@/lib/supabase/client";
import type { AuthUser } from "../types/auth.types";

function mapSessionUser(user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>["user"]): AuthUser {
  // DB stores role as lowercase ('treasurer'/'member'); normalise to uppercase for client-side type.
  const rawRole = (user.user_metadata?.role as string | undefined)?.toUpperCase();
  return {
    id: user.id,
    email: user.email ?? "",
    role: (rawRole as AuthUser["role"]) ?? "MEMBER",
    memberId: user.user_metadata?.member_id ?? null,
  };
}

export const authRepository = {
  async signUp(email: string, password: string, fullName: string, role: "member" | "treasurer"): Promise<AuthUser> {
    // Route through our own API endpoint which uses the Admin SDK.
    // This bypasses Supabase's client-side email rate limits and auto-confirms accounts.
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, role }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message ?? "Registration failed.");
    }

    // After account is created, sign in immediately to establish a session.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(error?.message ?? "Sign in after registration failed.");
    return mapSessionUser(data.session.user);
  },

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
