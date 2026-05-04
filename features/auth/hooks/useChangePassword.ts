// features/auth/hooks/useChangePassword.ts
// Layer 3 — APPLICATION: Mutation hook for changing the authenticated user's password

"use client";

import { useMutation } from "@tanstack/react-query";
import { authRepository } from "../repositories/auth.repository";

export function useChangePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => authRepository.changePassword(newPassword),
  });
}
