// features/auth/hooks/useRegister.ts
// Layer 3 — APPLICATION: Registration mutation hook. No JSX. No direct Supabase calls.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authRepository } from "../repositories/auth.repository";

export type RegisterRole = "member" | "treasurer";

interface RegisterResult {
  /** true when Supabase requires email confirmation before the session is active */
  requiresEmailConfirmation: boolean;
}

function mapErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("unable to validate") || lower.includes("invalid email")) {
    return "Invalid email address.";
  }
  if (
    lower.includes("too many requests") ||
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit exceeded")
  ) {
    return "Too many sign-up attempts. Supabase limits registrations to prevent abuse. Please wait a few minutes and try again, or use the Supabase dashboard to create the account directly.";
  }
  return "Registration failed. Please try again.";
}

export function useRegister(role: RegisterRole) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function register(
    email: string,
    password: string,
    fullName: string
  ): Promise<RegisterResult> {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authRepository.signUp(email, password, fullName, role);

      // If the account is pending approval, send to the pending page.
      if (role === "member" && user.accountStatus === "pending") {
        router.replace("/pending-approval");
      } else {
        // Pre-linked accounts (treasurer invited) or treasurer registrations go to login.
        router.replace("/login");
      }
      return { requiresEmailConfirmation: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(mapErrorMessage(message));
      return { requiresEmailConfirmation: false };
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading, error };
}
