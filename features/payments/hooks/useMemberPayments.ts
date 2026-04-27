// features/payments/hooks/useMemberPayments.ts
// Layer 3 — APPLICATION: Fetches individual payment records for a member

"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { Payment } from "../types/payment.types";

export function useMemberPayments(memberId: string) {
  return useQuery<Payment[]>({
    queryKey: ["payments", "member", memberId],
    queryFn: () => paymentRepository.getByMember(memberId),
    enabled: Boolean(memberId),
  });
}
