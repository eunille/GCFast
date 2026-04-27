// features/payments/hooks/useRecordPayment.ts
// Layer 3 — APPLICATION: Mutation hook for recording a new payment

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import { recordPaymentSchema, type RecordPaymentInput } from "../types/payment.schemas";

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordPaymentInput) => {
      const parsed = recordPaymentSchema.parse(input);
      return paymentRepository.record(parsed);
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the full list and this member's specific queries
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", variables.memberId] });
    },
  });
}
