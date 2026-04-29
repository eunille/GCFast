// features/payments/components/PaymentTable/PaymentTable.tsx
// Layer 4 — PRESENTATIONAL: Paginated member payment summaries table + filter bar

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { usePaymentSummaries } from "../../hooks/usePaymentSummaries";
import { PaymentStatusBadge } from "../PaymentStatusBadge";
import { useColleges } from "@/lib/hooks/useColleges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import type { PaymentSummaryQuery, PaymentSummaryRow } from "@/lib/models";

const PAGE_SIZE = 10;
const DEFAULT_FILTER: PaymentSummaryQuery = { page: 1, pageSize: PAGE_SIZE };

interface Props {
  onRecord: (memberId: string) => void;
}

export function PaymentTable({ onRecord }: Props) {
  const router = useRouter();
  const { data: colleges = [] } = useColleges();
  const [filter, setFilter] = useState<PaymentSummaryQuery>(DEFAULT_FILTER);
  const [searchInput, setSearchInput] = useState("");

  // Debounced search — update filter.search after 300ms
  const [, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setDebounceTimer((prev) => {
      if (prev) clearTimeout(prev);
      return setTimeout(() => {
        setFilter((f) => ({ ...f, search: value || undefined, page: 1 }));
      }, 300);
    });
  }, []);

  const { data, isLoading, isError } = usePaymentSummaries(filter);
  const rows: PaymentSummaryRow[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.count / PAGE_SIZE) : 1;
  const currentPage = filter.page ?? 1;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 w-56"
          />
        </div>

        {/* College */}
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

        {/* Member type */}
        <Select
          value={filter.memberType ?? "all"}
          onValueChange={(v) =>
            setFilter((f) => ({ ...f, memberType: v === "all" ? undefined : (v as "FULL_TIME" | "ASSOCIATE"), page: 1 }))
          }
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full Time</SelectItem>
            <SelectItem value="ASSOCIATE">Associate</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filter.status ?? "all"}
          onValueChange={(v) =>
            setFilter((f) => ({ ...f, status: v === "all" ? undefined : (v as "COMPLETE" | "HAS_BALANCE"), page: 1 }))
          }
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="COMPLETE">All Paid</SelectItem>
            <SelectItem value="HAS_BALANCE">Has Balance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {isError && (
        <p className="text-sm text-destructive">Failed to load payments. Please try again.</p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member Name</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Membership Fee</TableHead>
            <TableHead className="text-center">Periods Paid</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((__, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.member_id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/treasurer/members/${row.member_id}`)}
              >
                <TableCell>
                  <p className="text-sm font-medium">{row.full_name}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </TableCell>
                <TableCell className="text-sm">
                  <p>{row.college_name}</p>
                  <p className="text-xs text-muted-foreground">{row.college_code}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {row.member_type === "FULL_TIME" ? "Full Time" : "Associate"}
                </TableCell>
                <TableCell className="text-center">
                  {row.membership_fee_paid ? (
                    <span className="text-emerald-600 font-bold">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {row.periods_paid} / {row.periods_expected}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {formatCurrency(row.outstanding_balance)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={row.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRecord(row.member_id)}
                  >
                    Record
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

