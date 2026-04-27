// features/auth/hooks/useAuth.ts
// Layer 3 — APPLICATION: Current authenticated user state

"use client";

import { useEffect, useState } from "react";
import { authRepository } from "../repositories/auth.repository";
import type { AuthUser } from "../types/auth.types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authRepository.getSession().then((u) => {
      setUser(u);
      setIsLoading(false);
    });

    const unsubscribe = authRepository.onAuthStateChange((u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  return { user, isLoading, isAuthenticated: user !== null };
}
