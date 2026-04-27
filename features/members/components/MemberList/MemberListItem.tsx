// features/members/components/MemberList/MemberListItem.tsx
// Layer 4 — PRESENTATIONAL: Renders a single row in the member list table

import type { Member } from "../../types/member.types";

interface Props {
  member: Member;
  onClick?: (id: string) => void;
}

export function MemberListItem(_props: Props) {
  return null;
}
