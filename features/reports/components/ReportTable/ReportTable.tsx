// app/components/PaymentBreakdownTable.tsx
// Usage: Place in your Next.js 15 app and import where needed.
// Requires: shadcn/ui (Card, Table, Badge), Tailwind CSS, and the `cn` utility.

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepartmentRow {
  name: string;
  totalMembers: number;
  membersPaid: number;
  totalCollected: number;
  outstanding: number;
  collectionRate: number; // 0–100
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const data: DepartmentRow[] = [
  {
    name: "College of Engineering",
    totalMembers: 68,
    membersPaid: 58,
    totalCollected: 287500,
    outstanding: 42000,
    collectionRate: 87,
  },

];

// ─── Totals ────────────────────────────────────────────────────────────────────

const totals = {
  totalMembers: data.reduce((s, r) => s + r.totalMembers, 0),
  membersPaid: data.reduce((s, r) => s + r.membersPaid, 0),
  totalCollected: data.reduce((s, r) => s + r.totalCollected, 0),
  outstanding: data.reduce((s, r) => s + r.outstanding, 0),
  collectionRate: Math.round(
    data.reduce((s, r) => s + r.collectionRate, 0) / data.length,
  ),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const peso = (n: number) =>
  "₱" +
  n.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

/** Green ≥85 %, orange <85 % */
function RateBar({ rate }: { rate: number }) {
  const isGreen = rate >= 85;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 w-28 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            isGreen ? "bg-emerald-500" : "bg-amber-400",
          )}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span
        className={cn(
          "min-w-[2.5rem] text-right text-sm font-semibold tabular-nums",
          isGreen ? "text-emerald-600" : "text-amber-500",
        )}
      >
        {rate}%
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportTable() {
  const generatedAt = "Wednesday, April 29, 2026 at 11:28 PM";

  return (
    <Card className="w-full rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-900">
          Detailed Breakdown
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Payment summary by college/department
        </CardDescription>
      </CardHeader>

      {/* Table */}
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="border-y border-gray-100 bg-transparent hover:bg-transparent">
              {[
                "College/Department",
                "Total Members",
                "Members Paid",
                "Total Collected",
                "Outstanding",
                "Collection Rate",
              ].map((h) => (
                <TableHead
                  key={h}
                  className={cn(
                    "py-3 text-xs font-medium text-gray-400",
                    h === "College/Department" ? "pl-6" : "text-center",
                  )}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.name}
                className="border-b border-gray-50 transition-colors hover:bg-gray-50/60"
              >
                {/* Name */}
                <TableCell className="py-4 pl-6 font-semibold text-gray-800">
                  {row.name}
                </TableCell>

                {/* Total Members */}
                <TableCell className="py-4 text-center text-sm text-gray-600 tabular-nums">
                  {row.totalMembers}
                </TableCell>

                {/* Members Paid */}
                <TableCell className="py-4 text-center text-sm text-gray-600 tabular-nums">
                  {row.membersPaid}
                </TableCell>

                {/* Total Collected */}
                <TableCell className="py-4 text-center text-sm font-semibold text-emerald-600 tabular-nums">
                  {peso(row.totalCollected)}
                </TableCell>

                {/* Outstanding */}
                <TableCell className="py-4 text-center text-sm font-semibold text-amber-500 tabular-nums">
                  {peso(row.outstanding)}
                </TableCell>

                {/* Collection Rate */}
                <TableCell className="py-4 pr-6">
                  <RateBar rate={row.collectionRate} />
                </TableCell>
              </TableRow>
            ))}

            {/* Totals Row */}
            <TableRow className="border-t border-gray-200 bg-gray-50/70 hover:bg-gray-50/70">
              <TableCell className="py-4 pl-6 text-sm font-bold text-gray-900">
                Total
              </TableCell>
              <TableCell className="py-4 text-center text-sm font-bold text-gray-900 tabular-nums">
                {totals.totalMembers}
              </TableCell>
              <TableCell className="py-4 text-center text-sm font-bold text-gray-900 tabular-nums">
                {totals.membersPaid}
              </TableCell>
              <TableCell className="py-4 text-center text-sm font-bold text-emerald-600 tabular-nums">
                {peso(totals.totalCollected)}
              </TableCell>
              <TableCell className="py-4 text-center text-sm font-bold text-amber-500 tabular-nums">
                {peso(totals.outstanding)}
              </TableCell>
              <TableCell className="py-4 pr-6 text-sm font-bold text-gray-900">
                {totals.collectionRate}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">
            Report generated on {generatedAt}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
