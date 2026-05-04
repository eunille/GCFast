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

function getDescription(p: PaymentRecord): string {
  if (p.paymentType === "MEMBERSHIP_FEE") return "Membership Fee";
  const month = new Date(p.paymentDate).toLocaleString("en-PH", { month: "long" });
  return `Monthly Dues - ${month}`;
}

export function PaymentHistoryTable({ payments, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-32">Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-28 text-right">Amount</TableHead>
          <TableHead className="w-24 text-center">Status</TableHead>
          <TableHead className="w-32 text-right">Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(p.paymentDate)}
            </TableCell>
            <TableCell className="text-sm font-medium text-foreground">
              {getDescription(p)}
            </TableCell>
            <TableCell className="text-sm font-semibold text-foreground text-right">
              {formatCurrency(p.amountPaid)}
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant="outline"
                className="text-xs font-medium text-status-paid border-status-paid bg-status-paid-bg"
              >
                Paid
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground text-right">
              {p.referenceNumber ? `# ${p.referenceNumber}` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
