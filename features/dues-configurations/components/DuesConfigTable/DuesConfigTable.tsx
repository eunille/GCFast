// features/dues-configurations/components/DuesConfigTable/DuesConfigTable.tsx
// Layer 4 — PRESENTATIONAL: Displays current or historical rate records.

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import type { DuesConfig } from "@/features/dues-configurations/types/dues-config.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  MEMBERSHIP_FEE: "Membership Fee",
  MONTHLY_DUES: "Monthly Dues",
};

const MEMBER_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  ASSOCIATE: "Associate",
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

export function DuesConfigTableSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {["Payment Type", "Member Type", "Amount", "Effective From", "Status"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 5 }).map((_, j) => (
                <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  configs: DuesConfig[];
}

export function DuesConfigTable({ configs }: Props) {
  if (configs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        No rate records found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Type</TableHead>
            <TableHead>Member Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.map((cfg) => (
            <TableRow key={cfg.id}>
              <TableCell className="font-medium">
                {PAYMENT_TYPE_LABEL[cfg.paymentType] ?? cfg.paymentType}
              </TableCell>
              <TableCell>{MEMBER_TYPE_LABEL[cfg.memberType] ?? cfg.memberType}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(cfg.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground">{fmtDate(cfg.effectiveFrom)}</TableCell>
              <TableCell>
                {cfg.effectiveUntil === null ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Active</Badge>
                ) : (
                  <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                    Closed {fmtDate(cfg.effectiveUntil)}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
