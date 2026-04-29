// features/members/hooks/useCreateMember.ts
// Layer 3 — APPLICATION: Mutation hook for creating a new member via POST /api/members

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";
import { createMemberSchema } from "../types/member.schemas";
import type { CreateMemberInput } from "@/lib/models";

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const validated = createMemberSchema.parse(input);
      return memberRepository.create(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

