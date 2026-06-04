// features/payments/types/payment.schemas.ts
// Layer 1 — DOMAIN: Zod validation schemas for payment inputs

import { z } from "zod";
import { paginationSchema } from "@/lib/utils/filter-schemas";

// ─── API-layer schemas (GFAST canonical model) ─────────────────────────────

export const apiRecordPaymentSchema = z
  .object({
    memberId: z.string().uuid(),
    paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]),
    amountPaid: z.number().positive("Amount must be greater than 0"),
    paymentDate: z.string().datetime().optional(), // ISO 8601 datetime (optional, defaults to now), e.g. "2025-06-04T15:30:00Z"
    academicPeriodId: z.string().uuid().optional(),
    referenceNumber: z.string().max(100).trim().optional(),
    notes: z.string().max(500).trim().optional(),
  })
  .refine(
    (d) => d.paymentType === "MEMBERSHIP_FEE" || !!d.academicPeriodId,
    {
      message: "academicPeriodId is required for MONTHLY_DUES",
      path: ["academicPeriodId"],
    }
  )
  .refine(
    (d) => {
      if (!d.paymentDate) return true; // optional field
      const paymentTime = new Date(d.paymentDate);
      const now = new Date();
      return paymentTime <= now; // no future dates allowed
    },
    {
      message: "Payment date cannot be in the future",
      path: ["paymentDate"],
    }
  );

export const apiPaymentSummaryFilterSchema = z
  .object({
    memberId: z.string().uuid().optional(),
    collegeId: z.string().uuid().optional(),
    memberType: z.enum(["FULL_TIME", "ASSOCIATE"]).optional(),
    status: z.enum(["COMPLETE", "HAS_BALANCE"]).optional(),
    hasMembershipFee: z.coerce.boolean().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2020).optional(),
    search: z.string().max(100).trim().optional(),
    sortBy: z
      .enum(["full_name", "outstanding_balance", "college_name", "periods_paid"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .merge(paginationSchema);

export const apiPaymentHistoryFilterSchema = z
  .object({
    paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]).optional(),
    year: z.coerce.number().int().min(2020).optional(),
    sortBy: z.enum(["payment_date", "amount_paid"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"), // latest first
  })
  .merge(paginationSchema);

export type ApiRecordPaymentInput = z.infer<typeof apiRecordPaymentSchema>;
export type ApiPaymentSummaryFilterParams = z.infer<typeof apiPaymentSummaryFilterSchema>;
export type ApiPaymentHistoryFilterParams = z.infer<typeof apiPaymentHistoryFilterSchema>;
