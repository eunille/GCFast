// features/members/components/MemberList/MemberListFilter.tsx
// Layer 4 — PRESENTATIONAL: Search + college + member-type + active filter bar

"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useColleges } from "@/lib/hooks/useColleges";
import type { MemberListQuery } from "@/lib/models";

interface Props {
  filter: MemberListQuery;
  onChange: (filter: MemberListQuery) => void;
}

export function MemberListFilter({ filter, onChange }: Props) {
  const { data: colleges = [] } = useColleges();
  const [searchValue, setSearchValue] = useState(filter.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search — 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ ...filter, search: searchValue || undefined, page: 1 });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 h-9 w-64"
        />
      </div>

      <Select
        value={filter.collegeId ?? "__all"}
        onValueChange={(v) =>
          onChange({ ...filter, collegeId: v === "__all" ? undefined : v, page: 1 })
        }
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="All Colleges" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All Colleges</SelectItem>
          {colleges.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.code} — {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filter.memberType ?? "__all"}
        onValueChange={(v) =>
          onChange({
            ...filter,
            memberType: v === "__all" ? undefined : (v as "FULL_TIME" | "ASSOCIATE"),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All Types</SelectItem>
          <SelectItem value="FULL_TIME">Full-Time</SelectItem>
          <SelectItem value="ASSOCIATE">Associate</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={
          filter.accountStatus === "pending"
            ? "pending"
            : filter.isActive === false
            ? "inactive"
            : "active"
        }
        onValueChange={(v) => {
          if (v === "pending") {
            onChange({ ...filter, accountStatus: "pending", isActive: undefined, page: 1 });
          } else if (v === "inactive") {
            onChange({ ...filter, accountStatus: undefined, isActive: false, page: 1 });
          } else {
            onChange({ ...filter, accountStatus: undefined, isActive: true, page: 1 });
          }
        }}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}


