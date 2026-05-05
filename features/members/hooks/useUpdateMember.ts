// features/members/hooks/useUpdateMember.ts
// Layer 3 — APPLICATION: Mutation hook for updating a member via PATCH /api/members/:id

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";
import type { UpdateMemberInput } from "@/lib/models";

export function useUpdateMember(memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMemberInput) => {
      // Strip null collegeId — null means "no college assigned yet", omit from payload
      // so the existing DB value is preserved rather than overwritten with null.
      const { collegeId, ...rest } = input as UpdateMemberInput & { collegeId?: string | null };
      const payload: UpdateMemberInput = collegeId != null ? { ...rest, collegeId } : rest;
      return memberRepository.update(memberId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

