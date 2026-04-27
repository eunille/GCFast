// features/members/components/MemberList/MemberListFilter.tsx
// Layer 4 — PRESENTATIONAL: Search + college + status filter bar for member list

import type { MemberFilter } from "../../types/member.types";

interface Props {
  filter: MemberFilter;
  onChange: (filter: MemberFilter) => void;
}

export function MemberListFilter(_props: Props) {
  return null;
}

