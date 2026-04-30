// features/payments/hooks/usePaymentSummaries.ts
// Layer 3 — APPLICATION: Fetches paginated member payment summaries

"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { PaymentSummaryQuery } from "@/lib/models";

export function usePaymentSummaries(filter: PaymentSummaryQuery = {}) {
  return useQuery({
    queryKey: ["payment-summaries", filter],
    queryFn: () => paymentRepository.getSummaries(filter),
    staleTime: 30 * 1000,
  });
}
