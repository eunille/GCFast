// features/members/components/MemberList/MemberList.tsx
// Layer 4 — PRESENTATIONAL: Member list page shell

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SlidersHorizontal, Plus, Users, Search } from "lucide-react";
import { MemberDataTable } from "./MemberDataTable";
import { getMemberColumns } from "./columns";
import { CreateMemberModal } from "../CreateMemberModal";
import { useMembers } from "../../hooks/useMembers";
import type { MemberListQuery } from "@/lib/models";

const PAGE_SIZE = 8;
const DEFAULT_FILTER: MemberListQuery = { page: 1, pageSize: PAGE_SIZE };

export function MemberList() {
  const router = useRouter();
  const [filter, setFilter] = useState<MemberListQuery>(DEFAULT_FILTER);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError } = useMembers(filter);
  const members = data?.data ?? [];
  const meta = data?.meta;

  const totalPages = meta ? Math.ceil(meta.count / PAGE_SIZE) : 1;
  const currentPage = filter.page ?? 1;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setFilter((f) => ({ ...f, search: val || undefined, page: 1 }));
  };

  const handlePageChange = (next: number) =>
    setFilter((f) => ({ ...f, page: next }));

  const handleView = useCallback(
    (id: string) => router.push(`/treasurer/members/${id}`),
    [router]
  );

  const columns = getMemberColumns(handleView);

  return (
    <div className="flex flex-col gap-6">
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
      <Card className="w-72 shadow-sm rounded-xl">
        <CardContent className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground leading-none">
              {meta?.count ?? "—"}
            </p>
            <p className="text-xs text-status-paid">+12 this month</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
            <Users className="h-5 w-5 text-accent-foreground" />
          </div>
        </CardContent>
      </Card>

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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </Button>
              <Button
                size="sm"
                className="gap-1.5 h-9 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add member
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search}
              onChange={handleSearch}
              className="pl-9 h-9"
            />
          </div>

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

      <CreateMemberModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
