// features/members/components/MemberList/MemberList.tsx
// Layer 4 — PRESENTATIONAL: Member list page shell

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { MemberDataTable } from "./MemberDataTable";
import { getMemberColumns } from "./columns";
import { MemberListFilter } from "./MemberListFilter";
import { CreateMemberModal } from "../CreateMemberModal";
import { MemberQuickViewModal } from "../MemberQuickViewModal/MemberQuickViewModal";
import { useMembers } from "../../hooks/useMembers";
import type { MemberListQuery } from "@/lib/models";

const PAGE_SIZE = 8;
const DEFAULT_FILTER: MemberListQuery = { page: 1, pageSize: PAGE_SIZE };

export function MemberList() {
  const router = useRouter();
  const [filter, setFilter] = useState<MemberListQuery>(DEFAULT_FILTER);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data, isLoading, isError } = useMembers(filter);
  const members = data?.data ?? [];
  const meta = data?.meta;

  const totalPages = meta ? Math.ceil(meta.count / PAGE_SIZE) : 1;
  const currentPage = filter.page ?? 1;

  const handlePageChange = (next: number) =>
    setFilter((f) => ({ ...f, page: next }));

  const handleView = useCallback((id: string) => setSelectedMemberId(id), []);
  const handleNavigate = useCallback(
    (id: string) => router.push(`/treasurer/members/${id}`),
    [router]
  );

  const columns = getMemberColumns(handleView, handleNavigate);

  return (
    <div className="-m-6 p-6 bg-white flex flex-col gap-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Member Management
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Manage your faculty members and their account permissions here.
        </p>
      </div>

      {/* ── Stat card ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-white py-2.5 px-4 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground leading-tight">
              {meta?.count ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">active members</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* ── Table panel ─────────────────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardContent className="p-6 flex flex-col gap-4">

          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base text-foreground">
                All members
              </p>
              {meta && (
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {meta.count}
                </p>
              )}
            </div>
            <CreateMemberModal />
          </div>

          {/* Search + filters */}
          <MemberListFilter filter={filter} onChange={setFilter} />

          {isError && (
            <p className="text-sm text-destructive">
              Failed to load members. Please try again.
            </p>
          )}

          {/* DataTable */}
          <MemberDataTable
            columns={columns}
            data={members}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

        </CardContent>
      </Card>

      <MemberQuickViewModal
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  );
}
