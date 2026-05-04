// features/dues-configurations/hooks/useCreateDuesConfig.ts
// Layer 3 — APPLICATION: Creates a new dues rate entry (treasurer only).

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duesConfigRepository } from "@/features/dues-configurations/repositories/dues-config.repository";
import type { CreateDuesConfigInput } from "@/features/dues-configurations/types/dues-config.types";

export function useCreateDuesConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDuesConfigInput) => duesConfigRepository.create(input),
    onSuccess: () => {
      // Invalidate both the list and the current-rates snapshot
      queryClient.invalidateQueries({ queryKey: ["dues-configurations"] });
    },
  });
}
