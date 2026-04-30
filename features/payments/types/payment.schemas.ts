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
    paymentDate: z.string().date(), // ISO date YYYY-MM-DD
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
  );

export const apiPaymentSummaryFilterSchema = z
  .object({
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
