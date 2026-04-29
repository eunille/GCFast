// features/members/components/MemberList/MemberListItem.tsx
// Layer 4 — PRESENTATIONAL: Single row in the member table

import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { StandingBadge } from "../StandingBadge";
import { colors } from "@/theme";
import type { Member } from "@/lib/models";

interface Props {
  member: Member;
  onClick?: (id: string) => void;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function MemberListItem({ member, onClick, selected, onSelectChange }: Props) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick?.(member.id)}
    >
      {/* Checkbox */}
      <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelectChange?.(Boolean(v))}
        />
      </TableCell>

      {/* Avatar + name + email */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: colors.brand.accent }}
          >
            {getInitials(member.fullName)}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: colors.text.primary }}>
              {member.fullName}
            </p>
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              {member.email}
            </p>
          </div>
        </div>
      </TableCell>

      {/* College */}
      <TableCell>
        <p className="text-sm" style={{ color: colors.text.primary }}>
          {member.collegeName ?? "—"}
        </p>
      </TableCell>

      {/* Payment Status */}
      <TableCell>
        <StandingBadge isActive={member.isActive} />
      </TableCell>

      {/* 3-dot actions */}
      <TableCell onClick={(e) => e.stopPropagation()} className="w-10 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onClick?.(member.id)}>
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

