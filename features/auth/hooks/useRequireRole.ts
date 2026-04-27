// features/auth/hooks/useRequireRole.ts
// Layer 3 — APPLICATION: Redirects if user lacks required role

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import type { UserRole } from "../types/auth.types";

export function useRequireRole(requiredRole: UserRole) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const roleHierarchy: Record<UserRole, number> = {
      MEMBER: 0,
      TREASURER: 1,
      ADMIN: 2,
    };
    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      router.replace("/unauthorized");
    }
  }, [user, isLoading, router, requiredRole]);

  return { user, isLoading };
}
