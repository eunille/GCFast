// features/payments/types/payment.types.ts
// Layer 1 — DOMAIN: Pure TypeScript. Zero framework dependencies.

export type PaymentType = "MEMBERSHIP_FEE" | "MONTHLY_DUES";

export type PaymentStatus = "COMPLETE" | "HAS_BALANCE";

export interface Payment {
  id: string;
  memberId: string;
  paymentType: PaymentType;
  amountPaid: number;
  paymentDate: Date;
  monthRef: number | null; // 1–12, only for MONTHLY_DUES
  yearRef: number | null;
  recordedBy: string;
}

export interface MemberPaymentSummary {
  memberId: string;
  memberName: string;
  college: string;
  membershipFeePaid: boolean;
  monthsPaid: number[]; // e.g. [1, 2, 3] = Jan, Feb, Mar paid
  outstandingBalance: number;
  status: PaymentStatus;
}

// Pure business rule — no React, no Supabase
export function computePaymentStatus(
  summary: Pick<MemberPaymentSummary, "membershipFeePaid" | "outstandingBalance">
): PaymentStatus {
  return summary.membershipFeePaid && summary.outstandingBalance === 0
    ? "COMPLETE"
    : "HAS_BALANCE";
}
