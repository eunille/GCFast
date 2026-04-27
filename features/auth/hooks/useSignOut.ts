// features/auth/hooks/useSignOut.ts
// Layer 3 — APPLICATION: Sign out hook. No JSX. No direct Supabase calls.

"use client";

import { useRouter } from "next/navigation";
import { authRepository } from "../repositories/auth.repository";

export function useSignOut() {
  const router = useRouter();

  async function signOut() {
    await authRepository.signOut();
    router.replace("/login");
  }

  return { signOut };
}
