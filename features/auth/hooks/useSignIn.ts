// features/auth/hooks/useSignIn.ts
// Layer 3 — APPLICATION: Sign-in mutation hook. No JSX. No direct Supabase calls.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authRepository } from "../repositories/auth.repository";
import type { AuthUser } from "../types/auth.types";

function mapErrorMessage(raw: string): string {
  if (raw.toLowerCase().includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (raw.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (raw.toLowerCase().includes("too many requests")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }
  return "Sign in failed. Please try again.";
}

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function signIn(email: string, password: string): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const user: AuthUser = await authRepository.signIn(email, password);

      if (user.role === "MEMBER" && user.accountStatus === "pending") {
        router.replace("/pending-approval");
        return;
      }
      if (user.role === "MEMBER" && user.accountStatus === "rejected") {
        setError("Your account has been rejected. Please contact the treasurer.");
        await authRepository.signOut();
        return;
      }

      if (user.role === "TREASURER" || user.role === "ADMIN") {
        router.replace("/treasurer/overview");
      } else {
        router.replace("/member/dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(mapErrorMessage(message));
    } finally {
      setIsLoading(false);
    }
  }

  return { signIn, isLoading, error };
}
