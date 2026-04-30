// features/members/hooks/useDeactivateMember.ts
// Layer 3 — APPLICATION: Mutation hook for deactivating a member via PATCH /api/members/:id/deactivate

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";

export function useDeactivateMember(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => memberRepository.deactivate(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
