// features/payments/hooks/usePaymentHistory.ts
// Layer 3 — APPLICATION: Fetches payment history for a single member

"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { PaymentHistoryQuery } from "@/lib/models";

export function usePaymentHistory(memberId: string | null, filter: PaymentHistoryQuery = {}) {
  return useQuery({
    queryKey: ["payment-history", memberId, filter],
    queryFn: () => paymentRepository.getByMember(memberId!, filter),
    enabled: Boolean(memberId),
    staleTime: 30 * 1000,
  });
}
