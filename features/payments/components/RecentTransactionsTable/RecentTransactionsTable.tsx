// features/payments/components/RecentTransactionsTable/RecentTransactionsTable.tsx
// Layer 4 — PRESENTATIONAL: Paginated payment transactions table with filters

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, Download } from "lucide-react";
import { usePaymentRecords } from "../../hooks/usePaymentRecords";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import type { PaymentRecordQuery, PaymentTransaction } from "@/lib/models";

const PAGE_SIZE = 10;
const DEFAULT_FILTER: PaymentRecordQuery = { page: 1, pageSize: PAGE_SIZE };

// Shorten UUID to "#12345"-style display code using last 5 chars
function shortId(id: string, ref: string | null): string {
  if (ref) return ref;
  return `#${id.replace(/-/g, "").slice(-5).toUpperCase()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function paymentTypeLabel(tx: PaymentTransaction): string {
  if (tx.paymentType === "MEMBERSHIP_FEE") return "Membership Fee";
  if (tx.periodLabel) return `Monthly - ${tx.periodLabel}`;
  return "Monthly Dues";
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  onRecord?: () => void;
}

export function RecentTransactionsTable({ onRecord }: Props) {
  const { data: colleges = [] } = useColleges();
  const [filter, setFilter] = useState<PaymentRecordQuery>(DEFAULT_FILTER);
  const [searchInput, setSearchInput] = useState("");

  const [, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setDebounceTimer((prev) => {
      if (prev) clearTimeout(prev);
      // search is client-side over visible rows since API doesn't support it on transactions
      return setTimeout(() => {
        setFilter((f) => ({ ...f, page: 1 }));
      }, 300);
    });
  }, []);

  const { data, isLoading, isError } = usePaymentRecords(filter);
  const allRows: PaymentTransaction[] = data?.data ?? [];

  // Client-side search on the loaded page (server search not supported on /api/payments)
  const rows = searchInput.trim()
    ? allRows.filter(
        (r) =>
          r.memberName.toLowerCase().includes(searchInput.toLowerCase()) ||
          r.memberEmail.toLowerCase().includes(searchInput.toLowerCase())
      )
    : allRows;

  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.count / PAGE_SIZE) : 1;
  const currentPage = filter.page ?? 1;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            <Input
              placeholder="Search members…"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 w-52"
            />
          </div>

          {/* College */}
          <Select
            value={filter.collegeId ?? "all"}
            onValueChange={(v) =>
              setFilter((f) => ({ ...f, collegeId: v === "all" ? undefined : v, page: 1 }))
            }
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="All Colleges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {colleges.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment type */}
          <Select
            value={filter.paymentType ?? "all"}
            onValueChange={(v) =>
              setFilter((f) => ({
                ...f,
                paymentType: v === "all" ? undefined : (v as "MEMBERSHIP_FEE" | "MONTHLY_DUES"),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MEMBERSHIP_FEE">Membership Fee</SelectItem>
              <SelectItem value="MONTHLY_DUES">Monthly Dues</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          {onRecord && (
            <Button size="sm" className="gap-1.5" onClick={onRecord}>
              + Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      {isError && (
        <p className="text-sm text-destructive">Failed to load transactions. Please try again.</p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Bill No.</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {shortId(tx.id, tx.referenceNumber)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                      {initials(tx.memberName || "?")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-36">{tx.memberName || "—"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(tx.paymentDate)}
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs font-medium">
                    Paid
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{paymentTypeLabel(tx)}</TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {formatCurrency(tx.amountPaid)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/treasurer/members/${tx.memberId}`}
                    className="text-xs text-accent hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {meta
            ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, meta.count)} of ${meta.count} transactions`
            : ""}
        </span>
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
}
