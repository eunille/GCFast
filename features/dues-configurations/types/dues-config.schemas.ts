// features/dues-configurations/types/dues-config.schemas.ts

import { z } from "zod";

export const apiCreateDuesConfigSchema = z
  .object({
    paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]),
    memberType: z.enum(["FULL_TIME", "ASSOCIATE"]),
    amount: z.number().positive("Amount must be greater than 0"),
    effectiveFrom: z.string().date(), // ISO date YYYY-MM-DD
  })
  .refine(
    (d) => !(d.paymentType === "MEMBERSHIP_FEE" && d.memberType === "ASSOCIATE"),
    {
      message: "ASSOCIATE members do not pay a MEMBERSHIP_FEE",
      path: ["paymentType"],
    }
  );

export const apiDuesConfigFilterSchema = z.object({
  paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]).optional(),
  memberType: z.enum(["FULL_TIME", "ASSOCIATE"]).optional(),
  activeOnly: z.coerce.boolean().default(true),
});

export type ApiCreateDuesConfigInput = z.infer<typeof apiCreateDuesConfigSchema>;
export type ApiDuesConfigFilterParams = z.infer<typeof apiDuesConfigFilterSchema>;
