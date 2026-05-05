// features/members/hooks/useMemberReport.ts
// Layer 3 — APPLICATION: Combines dashboard + payment history to build member report data

"use client";

import { useMemberDashboard } from "./useMemberDashboard";
import { usePaymentHistory } from "@/features/payments/hooks/usePaymentHistory";
import type { PaymentRecord } from "@/lib/models";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export interface MemberMonthRow {
  month: number;          // 1–12
  label: string;          // "January", "February" …
  isPaid: boolean;
  amount: number | null;
  paymentDate: string | null;    // "YYYY-MM-DD"
  referenceNumber: string | null;
}

export interface MemberReportData {
  year: number;
  fullName: string;
  generatedAt: string;            // ISO 8601
  // Summary
  totalPaid: number;
  membershipFeePaid: boolean;
  membershipFeeAmount: number;
  monthlyDuesTotal: number;
  monthsPaidCount: number;
  avgMonthly: number;
  // Table
  rows: MemberMonthRow[];
}

function monthLabel(month: number): string {
  return new Intl.DateTimeFormat("en-PH", { month: "long" }).format(
    new Date(2000, month - 1, 1)
  );
}

function buildReportData(
  year: number,
  fullName: string,
  payments: PaymentRecord[],
  membershipFeePaid: boolean
): MemberReportData {
  // Only dues payments for the selected year — use periodYear (the year being COVERED),
  // not paymentDate year (the year the payment was physically recorded).
  // e.g. January 2026 dues paid on May 5, 2026 → periodYear=2026, paymentDate year=2026 ✓
  //      but the month is periodMonth=1 (January), not paymentDate month=5 (May).
  const duesForYear = payments.filter(
    (p) =>
      p.paymentType === "MONTHLY_DUES" &&
      (p.periodYear !== null && p.periodYear !== undefined
        ? p.periodYear === year
        : new Date(p.paymentDate).getFullYear() === year)
  );

  // Build per-month index keyed by the academic period month (1-based)
  const byMonth = new Map<number, PaymentRecord>();
  for (const p of duesForYear) {
    // Use the period month (what month is being paid for), not payment date month
    const m = p.periodMonth !== null && p.periodMonth !== undefined
      ? p.periodMonth
      : new Date(p.paymentDate).getMonth() + 1;
    // Take the first/earliest payment per period month
    if (!byMonth.has(m)) byMonth.set(m, p);
  }

  const rows: MemberMonthRow[] = MONTHS.map((m) => {
    const p = byMonth.get(m);
    return {
      month: m,
      label: monthLabel(m),
      isPaid: Boolean(p),
      amount: p ? p.amountPaid : null,
      paymentDate: p ? p.paymentDate : null,
      referenceNumber: p ? p.referenceNumber : null,
    };
  });

  // Membership fee payment — no academic period, use paymentDate year
  const membershipFeePayment = payments.find(
    (p) =>
      p.paymentType === "MEMBERSHIP_FEE" &&
      new Date(p.paymentDate).getFullYear() === year
  );
  const membershipFeeAmount = membershipFeePayment?.amountPaid ?? 0;

  const monthlyDuesTotal = duesForYear.reduce((sum, p) => sum + p.amountPaid, 0);
  const monthsPaidCount  = byMonth.size;
  // Total paid = dues for this period year + membership fee paid this calendar year
  const totalPaid = duesForYear.reduce((sum, p) => sum + p.amountPaid, 0)
    + (membershipFeePayment?.amountPaid ?? 0);
  const avgMonthly = monthsPaidCount > 0 ? monthlyDuesTotal / monthsPaidCount : 0;

  return {
    year,
    fullName,
    generatedAt: new Date().toISOString(),
    totalPaid,
    membershipFeePaid,
    membershipFeeAmount,
    monthlyDuesTotal,
    monthsPaidCount,
    avgMonthly,
    rows,
  };
}

export function useMemberReport(year: number) {
  const {
    data: dashboard,
    isLoading: dashLoading,
    isError: dashError,
  } = useMemberDashboard();

  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
  } = usePaymentHistory(dashboard?.memberId ?? null, {
    sortBy: "payment_date",
    sortOrder: "asc",
    // No year filter — fetch all so switching years is instant (cached)
  });

  const isLoading = dashLoading || historyLoading;
  const isError   = dashError   || historyError;

  let reportData: MemberReportData | null = null;
  if (!isLoading && !isError && dashboard && historyData) {
    reportData = buildReportData(
      year,
      dashboard.fullName,
      historyData.data,
      dashboard.membershipFeePaid
    );
  }

  return { reportData, isLoading, isError, memberId: dashboard?.memberId ?? null };
}
