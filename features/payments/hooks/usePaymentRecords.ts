// features/payments/hooks/usePaymentRecords.ts
// Layer 3 — APPLICATION: Fetches paginated payment transaction records

"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { PaymentRecordQuery } from "@/lib/models";

export function usePaymentRecords(filter: PaymentRecordQuery = {}) {
  return useQuery({
    queryKey: ["payment-records", filter],
    queryFn: () => paymentRepository.getTransactions(filter),
    staleTime: 30 * 1000,
  });
}
