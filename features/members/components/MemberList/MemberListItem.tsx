// features/members/components/MemberList/MemberListItem.tsx
// Layer 4 — PRESENTATIONAL: Single row in the member table

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StandingBadge } from "../StandingBadge";
import { colors } from "@/theme";
import type { Member } from "@/lib/models";

interface Props {
  member: Member;
  onClick?: (id: string) => void;
}

export function MemberListItem({ member, onClick }: Props) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onClick?.(member.id)}
    >
      <TableCell style={{ color: colors.text.primary }} className="font-medium">
        {member.fullName}
      </TableCell>
      <TableCell style={{ color: colors.text.secondary }}>
        {member.collegeName ?? "—"}
      </TableCell>
      <TableCell style={{ color: colors.text.secondary }}>
        {member.memberType === "FULL_TIME" ? "Full-Time" : "Associate"}
      </TableCell>
      <TableCell style={{ color: colors.text.secondary }}>
        {member.employeeId ?? "—"}
      </TableCell>
      <TableCell>
        <StandingBadge isActive={member.isActive} />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClick?.(member.id)}
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

