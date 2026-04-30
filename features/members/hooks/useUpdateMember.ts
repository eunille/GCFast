// features/members/hooks/useUpdateMember.ts
// Layer 3 — APPLICATION: Mutation hook for updating a member via PATCH /api/members/:id

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";
import { updateMemberSchema } from "../types/member.schemas";
import type { UpdateMemberInput } from "@/lib/models";

export function useUpdateMember(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMemberInput) => {
      const validated = updateMemberSchema.parse(input);
      return memberRepository.update(memberId, validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

