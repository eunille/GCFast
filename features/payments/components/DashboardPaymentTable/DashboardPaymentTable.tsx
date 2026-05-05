// features/payments/components/DashboardPaymentTable/DashboardPaymentTable.tsx
// Layer 4 — PRESENTATIONAL: Payment tracking table with MF + Jan-Dec month columns

"use client";

import { useState, useCallback } from "react";
import { Check, Minus, Download, Filter } from "lucide-react";
import { usePaymentSummaries } from "../../hooks/usePaymentSummaries";
import { PaymentStatusBadge } from "../PaymentStatusBadge";
import { useColleges } from "@/lib/hooks/useColleges";
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

const PAGE_SIZE = 5;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  onRecord: (memberId: string) => void;
}

function MonthCell({ paid }: { paid: boolean }) {
  return (
    <TableCell className="text-center px-1.5">
      {paid ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
      ) : (
        <Minus className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
      )}
    </TableCell>
  );
}

function RowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 16 }).map((_, i) => (
        <TableCell key={i} className="px-1.5">
          <Skeleton className="h-4 w-full min-w-8" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DashboardPaymentTable({ onRecord }: Props) {
  const { data: colleges = [] } = useColleges();
  const [filter, setFilter] = useState<PaymentSummaryQuery>({
    page: 1, pageSize: PAGE_SIZE,
  });

  const handleCollege = useCallback((v: string) => {
    setFilter((f) => ({ ...f, collegeId: v === "all" ? undefined : v, page: 1 }));
  }, []);

  const handleStatus = useCallback((v: string) => {
    setFilter((f) => ({ ...f, status: v === "all" ? undefined : (v as PaymentSummaryQuery["status"]), page: 1 }));
  }, []);

  const { data, isLoading } = usePaymentSummaries(filter);
  const rows: PaymentSummaryRow[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.count / PAGE_SIZE) : 1;
  const currentPage = filter.page ?? 1;
  const totalCount = meta?.count ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* College filter */}
          <Select value={filter.collegeId ?? "all"} onValueChange={handleCollege}>
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

          {/* Status filter */}
          <Select value={filter.status ?? "all"} onValueChange={handleStatus}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="COMPLETE">All Dues Paid</SelectItem>
              <SelectItem value="HAS_BALANCE">Has Outstanding</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 bg-accent hover:bg-accent/90"
            onClick={() => onRecord("")}
          >
            + Record Payment
          </Button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-md border border-border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="min-w-36">Member</TableHead>
              <TableHead className="min-w-36">College</TableHead>
              {/* MF = Membership Fee */}
              <TableHead className="text-center w-10 px-1.5">MF</TableHead>
              {MONTHS.map((m) => (
                <TableHead key={m} className="text-center w-10 px-1.5">{m}</TableHead>
              ))}
              <TableHead className="text-right min-w-20">Balance</TableHead>
              <TableHead className="min-w-36">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <RowSkeleton key={i} />)
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={16} className="py-10 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.member_id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{row.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.college_name}</TableCell>
                  {/* MF column */}
                  <MonthCell paid={row.membership_fee_paid} />
                  {/* Month columns 1–12 */}
                  {MONTHS.map((_, idx) => (
                    <MonthCell key={idx} paid={(row.months_paid ?? []).includes(idx + 1)} />
                  ))}
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.outstanding_balance)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge status={row.status} />
                      <button
                        className="text-[11px] font-medium text-accent hover:text-accent/80 hover:underline underline-offset-2 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onRecord(row.member_id); }}
                      >
                        Record
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer: count + pagination ─────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {rows.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{(currentPage - 1) * PAGE_SIZE + rows.length} of {totalCount} members
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            Previous
          </Button>
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
    </div>
  );
}
