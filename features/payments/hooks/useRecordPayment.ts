// features/payments/hooks/useRecordPayment.ts
// Layer 3 — APPLICATION: Mutation hook for recording a new payment

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { RecordPaymentInput } from "@/lib/models";

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordPaymentInput) => paymentRepository.record(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-records"] });
      queryClient.invalidateQueries({ queryKey: ["payment-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history", variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "treasurer"] });
    },
  });
}

