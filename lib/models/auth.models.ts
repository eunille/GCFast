// lib/models/auth.models.ts
// Source of truth: API_MODELS.md — "Auth Models"

import type { ApiUserRole, UserRole } from "./shared.models";

/** Returned by GET /api/auth/me */
export interface AuthMe {
  id: string;
  email: string;
  fullName: string;
  role: ApiUserRole;
  memberId: string | null;
}

/** Client-side session shape used by useAuth() */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  memberId: string | null;
}

/** POST /api/auth/invite body (treasurer only) */
export interface InviteInput {
  email: string;
  fullName: string;
  memberId: string;
}
