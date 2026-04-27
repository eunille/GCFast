// features/payments/hooks/useMemberPaymentSummary.ts
// Layer 3 — APPLICATION: Derives a single member's MemberPaymentSummary from the full summaries list

"use client";

import { useMemo } from "react";
import { usePayments } from "./usePayments";
import type { MemberPaymentSummary } from "../types/payment.types";

export function useMemberPaymentSummary(memberId: string): {
  summary: MemberPaymentSummary | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = usePayments();

  const summary = useMemo(
    () => data?.find((s) => s.memberId === memberId) ?? null,
    [data, memberId]
  );

  return { summary, isLoading, isError };
}
