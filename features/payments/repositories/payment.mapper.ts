// features/payments/repositories/payment.mapper.ts
// Layer 2 — DATA: Maps raw Supabase snake_case rows → clean camelCase domain types

import { computePaymentStatus } from "../types/payment.types";
import type { Payment, MemberPaymentSummary } from "../types/payment.types";

export function mapPaymentFromDb(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    memberId: row.member_id as string,
    paymentType: row.payment_type as Payment["paymentType"],
    amountPaid: row.amount_paid as number,
    paymentDate: new Date(row.payment_date as string),
    monthRef: row.month_ref as number | null,
    yearRef: row.year_ref as number | null,
    recordedBy: row.recorded_by as string,
  };
}

export function mapPaymentSummaryFromDb(row: Record<string, unknown>): MemberPaymentSummary {
  const membershipFeePaid = row.membership_fee_paid as boolean;
  const outstandingBalance = row.outstanding_balance as number;

  return {
    memberId: row.member_id as string,
    memberName: row.full_name as string,
    college: row.college_name as string,
    membershipFeePaid,
    monthsPaid: (row.months_paid as number[]) ?? [],
    outstandingBalance,
    status: computePaymentStatus({ membershipFeePaid, outstandingBalance }),
  };
}
