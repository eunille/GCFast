import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const generateReportSchema = z
  .object({
    reportType: z.enum([
      "payment_summary",
      "outstanding_balance",
      "membership_status",
      "monthly_collection",
      "member_standing",
    ]).default("payment_summary"),
    startDate: z.string().regex(ISO_DATE, "startDate must be YYYY-MM-DD"),
    endDate:   z.string().regex(ISO_DATE, "endDate must be YYYY-MM-DD"),
    format:    z.enum(["json", "excel", "pdf"]),
    collegeId: z.string().uuid().optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "startDate must be on or before endDate",
    path: ["endDate"],
  });

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
