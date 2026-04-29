// features/auth/types/auth.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/auth.models.ts + lib/models/shared.models.ts

export type { UserRole, ApiUserRole } from "@/lib/models";
export type { AuthUser, AuthMe, InviteInput } from "@/lib/models";
