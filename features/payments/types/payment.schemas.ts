// features/payments/types/payment.schemas.ts
// Layer 1 — DOMAIN: Zod validation schemas for payment inputs

import { z } from "zod";

export const recordPaymentSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]),
  amountPaid: z.number().positive("Amount must be greater than 0"),
  paymentDate: z.date(),
  monthRef: z.number().min(1).max(12).nullable(),
  yearRef: z.number().min(2020).nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
