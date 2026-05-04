// features/payments/hooks/useMemberPaymentSummary.ts
// Layer 3 — APPLICATION: Fetches the payment summary row for a single member

"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { PaymentSummaryRow } from "@/lib/models";

export function useMemberPaymentSummary(memberId: string | null) {
  return useQuery<PaymentSummaryRow | null>({
    queryKey: ["payment-summaries", "member", memberId],
    queryFn: async () => {
      const result = await paymentRepository.getSummaries({
        memberId: memberId!,
        pageSize: 1,
      });
      return result.data[0] ?? null;
    },
    enabled: !!memberId,
    staleTime: 30 * 1000,
  });
}
