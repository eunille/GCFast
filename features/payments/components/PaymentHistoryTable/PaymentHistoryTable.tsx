// features/payments/components/PaymentHistoryTable/PaymentHistoryTable.tsx
// Layer 4 — PRESENTATIONAL: Table of payment records for a member

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import type { PaymentRecord } from "@/lib/models";

interface Props {
  payments: PaymentRecord[];
  isLoading?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PaymentHistoryTable({ payments, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reference #</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="text-sm">{formatDate(p.paymentDate)}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs font-normal">
                {p.paymentType === "MEMBERSHIP_FEE" ? "Membership Fee" : "Monthly Dues"}
              </Badge>
            </TableCell>
            <TableCell className="text-sm font-medium">
              {formatCurrency(p.amountPaid)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {p.referenceNumber ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
              {p.notes ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


