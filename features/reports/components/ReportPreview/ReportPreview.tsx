// features/reports/components/ReportPreview/ReportPreview.tsx
// Layer 4 — PRESENTATIONAL: Inline table for format="json" report results

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
import { formatCurrency } from "@/lib/utils/format";
import type { ReportData } from "@/lib/models";

interface Props {
  report: ReportData;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function ReportPreview({ report }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Members",   value: String(report.totalMembers) },
          { label: "Total Collected", value: formatCurrency(report.totalCollected) },
          { label: "College / Scope", value: report.college },
          { label: "Year",            value: String(report.year) },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className="text-base font-bold text-foreground truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Mem. Fee</TableHead>
              <TableHead className="text-center">Periods</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.members.map((m) => (
              <TableRow key={m.memberId}>
                <TableCell className="font-medium text-sm">{m.fullName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.collegeName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.memberType === "FULL_TIME" ? "Full-Time" : "Associate"}
                </TableCell>
                <TableCell className="text-center">
                  {m.membershipFeePaid ? (
                    <span className="text-emerald-600 font-bold">✓</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {m.periodsPaid}/{m.periodsExpected}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {m.outstandingBalance > 0
                    ? <span className="text-destructive">{formatCurrency(m.outstandingBalance)}</span>
                    : <span className="text-muted-foreground">—</span>
                  }
                </TableCell>
                <TableCell>
                  {m.status === "COMPLETE" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">All Paid</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">Has Balance</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(m.lastPaymentDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {report.members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No members found for this filter.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Generated at {new Date(report.generatedAt).toLocaleString("en-PH")} · {report.members.length} member(s)
      </p>
    </div>
  );
}

