// features/members/types/member.schemas.ts
// Layer 1 — DOMAIN: Zod validation schemas for member inputs

import { z } from "zod";

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
