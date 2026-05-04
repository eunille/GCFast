// features/members/hooks/useMemberProfile.ts
// Layer 3 — APPLICATION: Fetches the signed-in member's own profile record.
// Also exports the mutation hook for self-service updates.

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberMeRepository } from "../repositories/member-me.repository";
import type { Member } from "@/lib/models";
import type { SelfUpdateMemberInput } from "../types/member.schemas";

export function useMemberProfile() {
  return useQuery<Member>({
    queryKey: ["member", "profile"],
    queryFn: () => memberMeRepository.get(),
    staleTime: 30 * 1000,
  });
}

export function useUpdateMemberProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SelfUpdateMemberInput) => memberMeRepository.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "member"] });
    },
  });
}
