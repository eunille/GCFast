// features/auth/types/auth.types.ts
// Layer 1 — DOMAIN: Auth user and role types

export type UserRole = "MEMBER" | "TREASURER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  memberId: string | null;
}
