// features/members/components/MemberList/columns.tsx
// Layer 4 — PRESENTATIONAL: Column definitions for the Member DataTable

"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
import type { Member } from "@/lib/models";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Returns column definitions. Pass `onView` to open the quick-view modal and `onNavigate` to go to the full detail page. */
export function getMemberColumns(
  onView: (id: string) => void,
  onNavigate: (id: string) => void,
): ColumnDef<Member>[] {
  return [
    // ── Select column ──────────────────────────────────────────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // ── Member Name (avatar + name + email) ────────────────────────────────────
    {
      accessorKey: "fullName",
      header: "Member Name",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold bg-accent text-accent-foreground select-none"
            >
              {getInitials(member.fullName)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">
                {member.fullName}
              </p>
              <p className="text-xs truncate text-muted-foreground">
                {member.email}
              </p>
            </div>
          </div>
        );
      },
    },

    // ── College (name + code) ──────────────────────────────────────────────────
    {
      accessorKey: "collegeName",
      header: "College",
      cell: ({ row }) => {
        const { collegeName, collegeCode } = row.original;
        return (
          <div>
            <p className="text-sm text-foreground">
              {collegeName ?? "—"}
            </p>
            {collegeCode && (
              <p className="text-xs font-medium mt-0.5 text-accent">
                {collegeCode}
              </p>
            )}
          </div>
        );
      },
    },

    // ── Member Type ────────────────────────────────────────────────────────────
    {
      accessorKey: "memberType",
      header: "Member Type",
      cell: ({ row }) => (
        <p className="text-sm text-foreground whitespace-nowrap">
          {row.original.memberType === "FULL_TIME" ? "Full-Time" : "Associate"}
        </p>
      ),
    },

    // ── Employee ID ────────────────────────────────────────────────────────────
    {
      accessorKey: "employeeId",
      header: "Employee ID",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {row.original.employeeId ?? "—"}
        </p>
      ),
    },

    // ── Member Status (account active/inactive) ────────────────────────────────
    {
      id: "memberStatus",
      header: "Status",
      cell: ({ row }) => <StandingBadge isActive={row.original.isActive} />,
    },

    // ── Actions (3-dot menu) ───────────────────────────────────────────────────
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(row.original.id)}>
                Quick View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate(row.original.id)}>
                View Full Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
