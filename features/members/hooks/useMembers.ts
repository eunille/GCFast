// features/members/hooks/useMembers.ts
// Layer 3 — APPLICATION: Fetches the members list with optional filters

"use client";

import { useQuery } from "@tanstack/react-query";
import { memberRepository } from "../repositories/member.repository";
import type { Member, MemberFilter } from "../types/member.types";

export function useMembers(filter?: MemberFilter) {
  return useQuery<Member[]>({
    queryKey: ["members", filter],
    queryFn: () => memberRepository.getAll(filter),
  });
}
