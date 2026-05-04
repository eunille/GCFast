// features/payments/hooks/useRecordBulkPayment.ts
// Layer 3 — APPLICATION: Mutation hook for recording multiple monthly payments at once

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { RecordPaymentInput, PaymentRecord } from "@/lib/models";

export interface BulkPaymentResult {
  succeeded: PaymentRecord[];
  failed: Error[];
  total: number;
}

export function useRecordBulkPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: RecordPaymentInput[]): Promise<BulkPaymentResult> => {
      const results = await Promise.allSettled(
        inputs.map((input) => paymentRepository.record(input))
      );

      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<PaymentRecord> => r.status === "fulfilled")
        .map((r) => r.value);

      const failed = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => r.reason as Error);

      // If every single request failed, surface the first error upstream
      if (succeeded.length === 0) throw failed[0] ?? new Error("All payments failed");

      return { succeeded, failed, total: inputs.length };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-records"] });
      queryClient.invalidateQueries({ queryKey: ["payment-summaries"] });
      if (variables[0]?.memberId) {
        queryClient.invalidateQueries({
          queryKey: ["payment-history", variables[0].memberId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard", "treasurer"] });
    },
  });
}
