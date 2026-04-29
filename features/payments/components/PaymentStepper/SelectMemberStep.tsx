// features/payments/components/PaymentStepper/SelectMemberStep.tsx
// Layer 4 — PRESENTATIONAL: Step 1 — search and select a member

"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useMembers } from "@/features/members/hooks/useMembers";
import { useColleges } from "@/lib/hooks/useColleges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member, MemberListQuery } from "@/lib/models";

const PAGE_SIZE = 5;

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  onSelect: (member: Member) => void;
  preSelectedId?: string | null;
}

export function SelectMemberStep({ onSelect, preSelectedId: _ }: Props) {
  const { data: colleges = [] } = useColleges();
  const [filter, setFilter] = useState<MemberListQuery>({
    page: 1,
    pageSize: PAGE_SIZE,
    isActive: true,
  });
  const [searchInput, setSearchInput] = useState("");

  const [, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      setDebounceTimer((prev) => {
        if (prev) clearTimeout(prev);
        return setTimeout(() => {
          setFilter((f) => ({ ...f, search: value || undefined, page: 1 }));
        }, 300);
      });
    },
    []
  );

  const { data, isLoading } = useMembers(filter);
  const members = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.count / PAGE_SIZE) : 1;
  const currentPage = filter.page ?? 1;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-base font-semibold text-foreground">Select Member</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose the member to record payment for
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={filter.collegeId ?? "all"}
          onValueChange={(v) =>
            setFilter((f) => ({ ...f, collegeId: v === "all" ? undefined : v, page: 1 }))
          }
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All Colleges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {colleges.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Member list */}
      <div className="flex flex-col gap-1 rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b last:border-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))
        ) : members.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No members found.
          </div>
        ) : (
          members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="flex items-center gap-3 p-4 text-left hover:bg-muted/60 border-b last:border-0 transition-colors"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
                {initials(m.fullName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{m.fullName}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.collegeName ?? ""}{m.collegeName && m.collegeCode ? ` • ${m.collegeCode}` : ""}
                </p>
              </div>

              {/* Status badge */}
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${
                  m.isActive
                    ? "border-emerald-500 text-emerald-700"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {m.isActive ? "Active" : "Inactive"}
              </Badge>
            </button>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {meta
              ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, meta.count)} of ${meta.count} members`
              : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
