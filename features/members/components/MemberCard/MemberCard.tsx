// features/members/components/MemberCard/MemberCard.tsx
// Layer 4 — PRESENTATIONAL: Compact summary card for a single member

import { Card, CardContent } from "@/components/ui/card";
import { StandingBadge } from "../StandingBadge";
import { colors, spacing } from "@/theme";
import type { Member } from "@/lib/models";

interface Props {
  member: Member;
}

export function MemberCard({ member }: Props) {
  return (
    <Card>
      <CardContent style={{ padding: spacing[4] }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="font-medium truncate"
              style={{ color: colors.text.primary }}
            >
              {member.fullName}
            </p>
            <p
              className="text-sm truncate"
              style={{ color: colors.text.secondary }}
            >
              {member.collegeName ?? member.collegeId}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: colors.text.secondary }}
            >
              {member.memberType === "FULL_TIME" ? "Full-Time" : "Associate"}
              {member.employeeId ? ` · ${member.employeeId}` : ""}
            </p>
          </div>
          <StandingBadge isActive={member.isActive} />
        </div>
      </CardContent>
    </Card>
  );
}

