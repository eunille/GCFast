// features/members/components/MemberList/MemberList.tsx
// Layer 4 — PRESENTATIONAL: Full member list with filter, table, and pagination

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberListFilter } from "./MemberListFilter";
import { MemberListItem } from "./MemberListItem";
import { CreateMemberModal } from "../CreateMemberModal";
import { useMembers } from "../../hooks/useMembers";
import { colors, spacing } from "@/theme";
import type { MemberListQuery } from "@/lib/models";

const DEFAULT_FILTER: MemberListQuery = { page: 1, pageSize: 20, isActive: true };

export function MemberList() {
  const router = useRouter();
  const [filter, setFilter] = useState<MemberListQuery>(DEFAULT_FILTER);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError } = useMembers(filter);
  const members = data?.data ?? [];
  const meta = data?.meta;

  const handlePageChange = (next: number) =>
    setFilter((f) => ({ ...f, page: next }));

  return (
    <div>
      {/* Header row */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: spacing[4] }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Members
          {meta ? (
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: colors.text.secondary }}
            >
              ({meta.count} total)
            </span>
          ) : null}
        </h1>
        <Button
          onClick={() => setShowCreate(true)}
          style={{ backgroundColor: colors.brand.accent }}
        >
          + Add Member
        </Button>
      </div>

      <MemberListFilter filter={filter} onChange={setFilter} />

      {isError && (
        <p className="text-sm" style={{ color: colors.status.outstanding }}>
          Failed to load members. Please try again.
        </p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: colors.surface.stripe }}>
              <TableHead>Full Name</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-2">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </TableRow>
                ))
              : members.map((member) => (
                  <MemberListItem
                    key={member.id}
                    member={member}
                    onClick={(id) => router.push(`/treasurer/members/${id}`)}
                  />
                ))}

            {!isLoading && members.length === 0 && (
              <TableRow>
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  No members found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.count > (filter.pageSize ?? 20) && (
        <div
          className="flex items-center justify-between mt-4"
          style={{ color: colors.text.secondary }}
        >
          <span className="text-sm">
            Page {meta.page} of {Math.ceil(meta.count / (filter.pageSize ?? 20))}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasMore}
              onClick={() => handlePageChange(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CreateMemberModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}


