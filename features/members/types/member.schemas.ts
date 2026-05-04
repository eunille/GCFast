// features/members/types/member.schemas.ts
// Layer 1 — DOMAIN: Zod validation schemas for member inputs
// Strictly aligned to API_MODELS.md CreateMemberInput / UpdateMemberInput

import { z } from "zod";
import { paginationSchema } from "@/lib/utils/filter-schemas";

// ─── Create ───────────────────────────────────────────────────────────────────

export const createMemberSchema = z.object({
  fullName:   z.string().min(2, "Full name must be at least 2 characters").max(100).trim(),
  email:      z.string().email("Invalid email address"),
  password:   z.string().min(6, "Password must be at least 6 characters").max(72).optional(),
  collegeId:  z.string().uuid("Invalid college"),
  memberType: z.enum(["FULL_TIME", "ASSOCIATE"], { message: "Member type is required" }),
  employeeId: z.string().max(50).trim().optional(),
  joinedAt:   z.string().date("Invalid date format").optional(), // ISO date YYYY-MM-DD
  notes:      z.string().max(500).trim().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

// ─── Update (all optional — PATCH semantics) ─────────────────────────────────

export const updateMemberSchema = createMemberSchema.partial();

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

// ─── Server-side route schemas (same canonical model — kept for API route usage) ─

export const apiCreateMemberSchema = createMemberSchema;
export const apiUpdateMemberSchema = updateMemberSchema;

export const apiMemberFilterSchema = z
  .object({
    collegeId:  z.string().uuid().optional(),
    memberType: z.enum(["FULL_TIME", "ASSOCIATE"]).optional(),
    isActive:   z.coerce.boolean().optional(),
    search:     z.string().max(100).trim().optional(),
    sortBy:     z.enum(["full_name", "joined_at", "college_name"]).optional(),
    sortOrder:  z.enum(["asc", "desc"]).default("asc"),
  })
  .merge(paginationSchema);

export type ApiCreateMemberInput = CreateMemberInput;
export type ApiUpdateMemberInput = UpdateMemberInput;
export type ApiMemberFilterParams = z.infer<typeof apiMemberFilterSchema>;
