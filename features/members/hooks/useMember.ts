// features/members/hooks/useMember.ts
// Layer 3 — APPLICATION: Fetches a single member by ID via /api/members/:id

"use client";

import { useQuery } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";
import type { Member } from "@/lib/models";

export function useMember(id: string) {
  return useQuery<Member | null>({
    queryKey: ["members", id],
    queryFn: () => memberRepository.getById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

