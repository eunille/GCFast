// features/payments/types/payment.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/payment.models.ts

export type { PaymentType, PaymentStatus } from "@/lib/models";
export type {
  PaymentRecord,
  RecordPaymentInput,
  PaymentRecordQuery,
  PaymentHistoryQuery,
  PaymentSummaryRow,
  PaymentSummaryQuery,
} from "@/lib/models";

// Alias: PaymentRecord is the canonical name — Payment kept for files not yet migrated.
export type { PaymentRecord as Payment } from "@/lib/models";

// Alias: PaymentSummaryRow is the canonical name — MemberPaymentSummary kept for files not yet migrated.
export type { PaymentSummaryRow as MemberPaymentSummary } from "@/lib/models";

// Pure business rule — no React, no Supabase
export function computePaymentStatus(
  summary: { membershipFeePaid?: boolean; membership_fee_paid?: boolean; outstandingBalance?: number; outstanding_balance?: number }
): PaymentStatus {
  const feePaid = summary.membershipFeePaid ?? summary.membership_fee_paid ?? false;
  const balance = summary.outstandingBalance ?? summary.outstanding_balance ?? 1;
  return feePaid && balance === 0 ? "COMPLETE" : "HAS_BALANCE";
}
