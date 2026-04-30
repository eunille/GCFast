// app/(treasurer)/treasurer/members/page.tsx
// Layer 4 — PRESENTATIONAL: Member list page (treasurer only)

export const dynamic = "force-dynamic";

import { MemberList } from "@/features/members/components/MemberList";

export default function TreasurerMembersPage() {
  return <MemberList />;
}

