// app/(treasurer)/treasurer/members/page.tsx
// Layer 4 — PRESENTATIONAL: Member list page (treasurer only)

export const dynamic = "force-dynamic";

import { MemberList } from "@/features/members/components/MemberList";
import { spacing } from "@/theme";

export default function TreasurerMembersPage() {
  return (
    <main style={{ padding: spacing[6] }}>
      <MemberList />
    </main>
  );
}

