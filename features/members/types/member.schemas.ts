// features/members/types/member.schemas.ts
// Layer 1 — DOMAIN: Zod validation schemas for member inputs

import { z } from "zod";
import { paginationSchema } from "@/lib/utils/filter-schemas";

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  collegeId: z.string().uuid("Invalid college ID"),
  role: z.enum(["MEMBER", "TREASURER", "ADMIN"]).default("MEMBER"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export const updateMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  collegeId: z.string().uuid("Invalid college ID"),
  role: z.enum(["MEMBER", "TREASURER", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

// ─── API-layer schemas (GFAST canonical model, server-side routes only) ──────

export const apiCreateMemberSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  email: z.string().email(),
  collegeId: z.string().uuid(),
  memberType: z.enum(["FULL_TIME", "ASSOCIATE"]),
  employeeId: z.string().max(50).trim().optional(),
  joinedAt: z.string().date().optional(), // ISO date YYYY-MM-DD
  notes: z.string().max(500).trim().optional(),
});

export const apiUpdateMemberSchema = apiCreateMemberSchema.partial();

export const apiMemberFilterSchema = z
  .object({
    collegeId: z.string().uuid().optional(),
    memberType: z.enum(["FULL_TIME", "ASSOCIATE"]).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().max(100).trim().optional(),
    sortBy: z
      .enum(["full_name", "joined_at", "college_name"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .merge(paginationSchema);

export type ApiCreateMemberInput = z.infer<typeof apiCreateMemberSchema>;
export type ApiUpdateMemberInput = z.infer<typeof apiUpdateMemberSchema>;
export type ApiMemberFilterParams = z.infer<typeof apiMemberFilterSchema>;
