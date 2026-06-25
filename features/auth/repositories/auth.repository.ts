// features/auth/repositories/auth.repository.ts
// Layer 2 — DATA: Only layer that calls Supabase auth. No JSX. No React hooks.

import { supabase } from "@/lib/supabase/client";
import type { AuthUser } from "../types/auth.types";
import type { AccountStatus } from "@/lib/models";

function mapSessionUser(
  user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>["user"],
  fullName: string = "",
  accountStatus: AccountStatus = "active"
): AuthUser {
  // DB stores role as lowercase ('treasurer'/'member'); normalise to uppercase for client-side type.
  const rawRole = (user.user_metadata?.role as string | undefined)?.toUpperCase();
  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    role: (rawRole as AuthUser["role"]) ?? "MEMBER",
    memberId: user.user_metadata?.member_id ?? null,
    accountStatus,
  };
}

/** Fetch user profile data from /api/auth/me — call after sign-in to hydrate fullName and accountStatus. */
async function fetchUserProfile(): Promise<{ fullName: string; accountStatus: AccountStatus }> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return { fullName: "", accountStatus: "active" };
    const json = await res.json();
    return {
      fullName: json?.data?.fullName ?? "",
      accountStatus: (json?.data?.accountStatus as AccountStatus) ?? "active",
    };
  } catch {
    return { fullName: "", accountStatus: "active" };
  }
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
    const profile = await fetchUserProfile();
    return mapSessionUser(data.session.user, profile.fullName, profile.accountStatus);
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(error?.message ?? "Sign in failed");
    const profile = await fetchUserProfile();
    return mapSessionUser(data.session.user, profile.fullName, profile.accountStatus);
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const profile = await fetchUserProfile();
    return mapSessionUser(session.user, profile.fullName, profile.accountStatus);
  },

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // accountStatus is fetched lazily by getSession() on next render
        callback(mapSessionUser(session.user, "active"));
      } else {
        callback(null);
      }
    });
    return () => subscription.unsubscribe();
  },
};
