// features/reports/components/ReportPreview/ReportPreview.tsx
// Layer 4 — PRESENTATIONAL: Dispatches to per-report-type sub-views

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
import { DollarSign, Clock, Users, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import type {
  ReportResult, PaymentSummaryReport, OutstandingBalanceReport,
  MembershipStatusReport, MonthlyCollectionReport, MemberStandingReport,
} from "@/lib/models";

// ─── Shared helpers ───────────────────────────────────────────────────────────

interface Props {
  report: ReportResult;
}

// ─── Summary metric card ────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ label, value, sub, icon, iconBg }: MetricCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white py-2.5 px-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

// ─── Collection-rate bar ─────────────────────────────────────────────────────

function RateBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "bg-emerald-500" :
    rate >= 60 ? "bg-amber-400"   :
                 "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-sm text-muted-foreground">{rate}%</span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

// ─── Shared footer ────────────────────────────────────────────────────────────

function ReportFooter({ generatedAt }: { generatedAt: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      Report generated on{" "}
      {new Date(generatedAt).toLocaleDateString("en-PH", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })}{" "}at{" "}
      {new Date(generatedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true })}
    </p>
  );
}

// ─── PaymentSummaryView ───────────────────────────────────────────────────────

function PaymentSummaryView({ report }: { report: PaymentSummaryReport }) {
  const totals = report.breakdown.reduce(
    (acc, r) => ({
      totalMembers:   acc.totalMembers   + r.totalMembers,
      membersPaid:    acc.membersPaid    + r.membersPaid,
      totalCollected: acc.totalCollected + r.totalCollected,
      outstanding:    acc.outstanding    + r.outstanding,
    }),
    { totalMembers: 0, membersPaid: 0, totalCollected: 0, outstanding: 0 }
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Report header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <DollarSign className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Payment Summary Report</p>
            <p className="text-sm text-muted-foreground">
              Period: {fmtDate(report.startDate)} – {fmtDate(report.endDate)}
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-0">Report Ready</Badge>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Total Collected"
          value={formatCurrency(report.totalCollected)}
          sub={`${report.collegeScope}`}
          icon={<DollarSign className="h-5 w-5 text-accent" />}
          iconBg="bg-accent/10"
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(report.outstanding)}
          sub={`${report.totalMembers - report.membersPaid} member(s)`}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-100"
        />
        <MetricCard
          label="Members Paid"
          value={String(report.membersPaid)}
          sub={`${report.membersPaidPercent}% of total`}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-100"
        />
        <MetricCard
          label="Avg. Collection"
          value={formatCurrency(report.avgCollectionPerMember)}
          sub="per member"
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          iconBg="bg-emerald-100"
        />
      </div>

      {/* Detailed breakdown */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">Detailed Breakdown</p>
          <p className="text-sm text-muted-foreground">Payment summary by college/department</p>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College/Department</TableHead>
                <TableHead className="text-right">Total Members</TableHead>
                <TableHead className="text-right">Members Paid</TableHead>
                <TableHead className="text-right">Total Collected</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.breakdown.map((row) => (
                <TableRow key={row.collegeId}>
                  <TableCell className="font-medium">{row.collegeName}</TableCell>
                  <TableCell className="text-right">{row.totalMembers}</TableCell>
                  <TableCell className="text-right">{row.membersPaid}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    {formatCurrency(row.totalCollected)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 font-medium">
                    {formatCurrency(row.outstanding)}
                  </TableCell>
                  <TableCell>
                    <RateBar rate={row.collectionRate} />
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals row */}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{totals.totalMembers}</TableCell>
                <TableCell className="text-right font-bold">{totals.membersPaid}</TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  {formatCurrency(totals.totalCollected)}
                </TableCell>
                <TableCell className="text-right font-bold text-orange-600">
                  {formatCurrency(totals.outstanding)}
                </TableCell>
                <TableCell className="font-bold text-sm">
                  {report.membersPaidPercent}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {report.breakdown.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No payment data found for this date range.
          </p>
        )}
      </div>

      {/* Footer */}
      <ReportFooter generatedAt={report.generatedAt} />
    </div>
  );
}

// ─── OutstandingBalanceView ───────────────────────────────────────────────────

function OutstandingBalanceView({ report }: { report: OutstandingBalanceReport }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Outstanding Balance Report</p>
            <p className="text-sm text-muted-foreground">Period: {fmtDate(report.startDate)} – {fmtDate(report.endDate)}</p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-0">Report Ready</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <MetricCard label="Total Outstanding" value={formatCurrency(report.totalOutstanding)} sub={report.collegeScope} icon={<Clock className="h-5 w-5 text-orange-500" />} iconBg="bg-orange-100" />
        <MetricCard label="Members with Balance" value={String(report.membersWithBalance)} sub={`of ${report.totalMembers} total`} icon={<Users className="h-5 w-5 text-red-500" />} iconBg="bg-red-100" />
        <MetricCard label="Fully Paid Members" value={String(report.totalMembers - report.membersWithBalance)} sub={`${report.totalMembers > 0 ? Math.round(((report.totalMembers - report.membersWithBalance) / report.totalMembers) * 100) : 0}% complete`} icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-100" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Periods Paid</TableHead>
              <TableHead className="text-right">Periods Expected</TableHead>
              <TableHead className="text-right">Outstanding Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.members.map((m) => (
              <TableRow key={m.memberId}>
                <TableCell className="font-medium">{m.fullName}</TableCell>
                <TableCell>{m.collegeName}</TableCell>
                <TableCell>{m.memberType}</TableCell>
                <TableCell className="text-right">{m.periodsPaid}</TableCell>
                <TableCell className="text-right">{m.periodsExpected}</TableCell>
                <TableCell className="text-right text-orange-600 font-medium">{formatCurrency(m.outstandingBalance)}</TableCell>
              </TableRow>
            ))}
            {report.members.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No outstanding balances found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ReportFooter generatedAt={report.generatedAt} />
    </div>
  );
}

// ─── MembershipStatusView ─────────────────────────────────────────────────────

function MembershipStatusView({ report }: { report: MembershipStatusReport }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Membership Status Report</p>
            <p className="text-sm text-muted-foreground">Period: {fmtDate(report.startDate)} – {fmtDate(report.endDate)}</p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-0">Report Ready</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard label="Total Members" value={String(report.totalMembers)} sub={report.collegeScope} icon={<Users className="h-5 w-5 text-blue-500" />} iconBg="bg-blue-100" />
        <MetricCard label="All Paid" value={String(report.totalComplete)} sub="COMPLETE status" icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-100" />
        <MetricCard label="Has Balance" value={String(report.totalHasBalance)} sub="HAS_BALANCE status" icon={<Clock className="h-5 w-5 text-orange-500" />} iconBg="bg-orange-100" />
        <MetricCard label="Overall Complete" value={`${report.overallCompletePercent}%`} sub="of all members" icon={<DollarSign className="h-5 w-5 text-accent" />} iconBg="bg-accent/10" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>College/Department</TableHead>
              <TableHead className="text-right">Total Members</TableHead>
              <TableHead className="text-right">All Paid</TableHead>
              <TableHead className="text-right">Has Balance</TableHead>
              <TableHead>Complete %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.breakdown.map((row) => (
              <TableRow key={row.collegeId}>
                <TableCell className="font-medium">{row.collegeName}</TableCell>
                <TableCell className="text-right">{row.totalMembers}</TableCell>
                <TableCell className="text-right text-emerald-600 font-medium">{row.complete}</TableCell>
                <TableCell className="text-right text-orange-600 font-medium">{row.hasBalance}</TableCell>
                <TableCell><RateBar rate={row.completePercent} /></TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30 font-bold">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-right font-bold">{report.totalMembers}</TableCell>
              <TableCell className="text-right font-bold text-emerald-600">{report.totalComplete}</TableCell>
              <TableCell className="text-right font-bold text-orange-600">{report.totalHasBalance}</TableCell>
              <TableCell className="font-bold text-sm">{report.overallCompletePercent}%</TableCell>
            </TableRow>
            {report.breakdown.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No data found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ReportFooter generatedAt={report.generatedAt} />
    </div>
  );
}

// ─── MonthlyCollectionView ────────────────────────────────────────────────────

function MonthlyCollectionView({ report }: { report: MonthlyCollectionReport }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <DollarSign className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Monthly Collection Report</p>
            <p className="text-sm text-muted-foreground">Period: {fmtDate(report.startDate)} – {fmtDate(report.endDate)}</p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-0">Report Ready</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Total Collected" value={formatCurrency(report.totalCollected)} sub={report.collegeScope} icon={<DollarSign className="h-5 w-5 text-accent" />} iconBg="bg-accent/10" />
        <MetricCard label="Months in Range" value={String(report.months.length)} sub="with payment activity" icon={<TrendingUp className="h-5 w-5 text-blue-500" />} iconBg="bg-blue-100" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Total Collected</TableHead>
              <TableHead className="text-right"># Payments</TableHead>
              <TableHead className="text-right">Members Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.months.map((m) => (
              <TableRow key={m.yearMonth}>
                <TableCell className="font-medium">{m.label}</TableCell>
                <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(m.totalCollected)}</TableCell>
                <TableCell className="text-right">{m.paymentCount}</TableCell>
                <TableCell className="text-right">{m.uniqueMembers}</TableCell>
              </TableRow>
            ))}
            {report.months.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No payments found in this date range.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ReportFooter generatedAt={report.generatedAt} />
    </div>
  );
}

// ─── MemberStandingView ───────────────────────────────────────────────────────

function MemberStandingView({ report }: { report: MemberStandingReport }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Member Standing Report</p>
            <p className="text-sm text-muted-foreground">Period: {fmtDate(report.startDate)} – {fmtDate(report.endDate)}</p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-0">Report Ready</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <MetricCard label="Total Members" value={String(report.totalMembers)} sub={report.collegeScope} icon={<Users className="h-5 w-5 text-blue-500" />} iconBg="bg-blue-100" />
        <MetricCard label="All Paid" value={String(report.totalComplete)} sub="COMPLETE status" icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} iconBg="bg-emerald-100" />
        <MetricCard label="Has Balance" value={String(report.totalHasBalance)} sub="HAS_BALANCE status" icon={<Clock className="h-5 w-5 text-orange-500" />} iconBg="bg-orange-100" />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Mem. Fee</TableHead>
              <TableHead className="text-right">Periods Paid</TableHead>
              <TableHead className="text-right">Periods Expected</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.members.map((m) => (
              <TableRow key={m.memberId}>
                <TableCell className="font-medium">{m.fullName}</TableCell>
                <TableCell>{m.collegeName}</TableCell>
                <TableCell>{m.memberType}</TableCell>
                <TableCell className="text-center">
                  {m.membershipFeePaid
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                    : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                </TableCell>
                <TableCell className="text-right">{m.periodsPaid}</TableCell>
                <TableCell className="text-right">{m.periodsExpected}</TableCell>
                <TableCell className="text-right text-orange-600 font-medium">{formatCurrency(m.outstandingBalance)}</TableCell>
                <TableCell>
                  <Badge className={m.status === "COMPLETE" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-red-100 text-red-700 border-0"}>
                    {m.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {report.members.length === 0 && (
              <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No members found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ReportFooter generatedAt={report.generatedAt} />
    </div>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export function ReportPreview({ report }: Props) {
  switch (report.reportType) {
    case "payment_summary":     return <PaymentSummaryView report={report} />;
    case "outstanding_balance": return <OutstandingBalanceView report={report} />;
    case "membership_status":   return <MembershipStatusView report={report} />;
    case "monthly_collection":  return <MonthlyCollectionView report={report} />;
    case "member_standing":     return <MemberStandingView report={report} />;
  }
}
