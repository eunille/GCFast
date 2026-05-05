// features/payments/repositories/payment.mapper.ts
// Layer 2 — DATA: Maps raw Supabase snake_case rows → clean camelCase domain types

import type { Payment, MemberPaymentSummary } from "../types/payment.types";

export function mapPaymentFromDb(row: Record<string, unknown>): Payment {
  return {
    id:               row.id as string,
    memberId:         row.member_id as string,
    paymentType:      row.payment_type as Payment["paymentType"],
    amountPaid:       row.amount_paid as number,
    paymentDate:      row.payment_date as string,
    academicPeriodId: (row.academic_period_id as string | null) ?? null,
    referenceNumber:  (row.reference_number as string | null) ?? null,
    notes:            (row.notes as string | null) ?? null,
    recordedBy:       row.recorded_by as string,
    createdAt:        row.created_at as string,
  };
}

export function mapPaymentSummaryFromDb(row: Record<string, unknown>): MemberPaymentSummary {
  return {
    member_id:                   row.member_id as string,
    full_name:                   row.full_name as string,
    email:                       row.email as string,
    employee_id:                 row.employee_id as string | null,
    member_type:                 row.member_type as MemberPaymentSummary["member_type"],
    joined_at:                   row.joined_at as string | null,
    college_id:                  row.college_id as string,
    college_name:                row.college_name as string,
    college_code:                row.college_code as string,
    membership_fee_paid:         row.membership_fee_paid as boolean,
    membership_fee_amount_paid:  row.membership_fee_amount_paid as number,
    periods_paid:                row.periods_paid as number,
    periods_expected:            row.periods_expected as number,
    months_paid:                 (row.months_paid as number[]) ?? [],
    total_dues_paid:             row.total_dues_paid as number,
    last_payment_date:           row.last_payment_date as string | null,
    outstanding_balance:         row.outstanding_balance as number,
    status:                      row.status as MemberPaymentSummary["status"],
  };
}
