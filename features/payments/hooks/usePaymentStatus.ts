// features/payments/hooks/usePaymentStatus.ts
// Layer 3 — APPLICATION: Pure derivation hook — no async, no side effects

"use client";

import { computePaymentStatus } from "../types/payment.types";
import type { MemberPaymentSummary } from "../types/payment.types";

export function usePaymentStatus(summary: MemberPaymentSummary) {
  const status = computePaymentStatus(summary);

  return {
    isComplete: status === "COMPLETE",
    hasBalance: status === "HAS_BALANCE",
    statusLabel: status === "COMPLETE" ? "All Dues Paid" : "Has Outstanding Balance",
    status,
  };
}
