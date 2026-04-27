// features/payments/hooks/usePayments.ts
// Layer 3 — APPLICATION: Fetches all member payment summaries

"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { MemberPaymentSummary } from "../types/payment.types";

export function usePayments(collegeId?: string) {
  return useQuery<MemberPaymentSummary[]>({
    queryKey: ["payments", "summaries", collegeId],
    queryFn: () => paymentRepository.getAllSummaries(collegeId),
  });
}
