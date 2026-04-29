import { z } from "zod";

export const generateReportSchema = z.object({
  collegeId: z.string().uuid().optional(),
  year: z.coerce.number().int().min(2020).max(2099),
  format: z.enum(["json", "excel", "pdf"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
