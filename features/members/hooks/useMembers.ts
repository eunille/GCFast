// features/members/hooks/useMembers.ts
// Layer 3 — APPLICATION: Fetches paginated member list via /api/members

"use client";

import { useQuery } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";
import type { MemberListQuery } from "@/lib/models";

export function useMembers(filter: MemberListQuery = {}) {
  return useQuery({
    queryKey: ["members", filter],
    queryFn: () => memberRepository.getAll(filter),
    staleTime: 30 * 1000,
  });
}

