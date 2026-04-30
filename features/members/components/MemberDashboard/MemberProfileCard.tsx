// features/members/components/MemberDashboard/MemberProfileCard.tsx
// Layer 4 — PRESENTATIONAL: Member info header card (used on the detail page)

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StandingBadge } from "../StandingBadge";
import { colors, spacing } from "@/theme";
import { formatDate } from "@/lib/utils/format";
import type { Member } from "@/lib/models";

interface Props {
  member: Member;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm shrink-0" style={{ color: colors.text.secondary }}>
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: colors.text.primary }}>
        {value}
      </span>
    </div>
  );
}

export function MemberProfileCard({ member }: Props) {
  return (
    <Card>
      <CardContent style={{ padding: spacing[5] }}>
        {/* Name + status */}
        <div className="flex items-start justify-between gap-2" style={{ marginBottom: spacing[3] }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
              {member.fullName}
            </h2>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              {member.email}
            </p>
          </div>
          <StandingBadge isActive={member.isActive} />
        </div>

        <Separator style={{ marginBottom: spacing[3] }} />

        <Row label="College" value={member.collegeName ?? "—"} />
        <Row
          label="Member Type"
          value={member.memberType === "FULL_TIME" ? "Full-Time" : "Associate"}
        />
        {member.employeeId && <Row label="Employee ID" value={member.employeeId} />}
        {member.joinedAt && (
          <Row label="Joined" value={formatDate(member.joinedAt)} />
        )}
        {member.notes && <Row label="Notes" value={member.notes} />}

        <Separator style={{ margin: `${spacing[3]} 0` }} />

        <Row
          label="Created"
          value={formatDate(member.createdAt)}
        />
        <Row
          label="Last Updated"
          value={formatDate(member.updatedAt)}
        />
        {member.profileId && (
          <Row label="Account" value="Linked ✓" />
        )}
      </CardContent>
    </Card>
  );
}


