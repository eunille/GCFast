// features/members/types/member.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/member.models.ts

export type { Member, CreateMemberInput, UpdateMemberInput, MemberListQuery } from "@/lib/models";
export type { MemberType } from "@/lib/models";

// Alias kept for any existing code that references MemberFilter — use MemberListQuery going forward.
export type { MemberListQuery as MemberFilter } from "@/lib/models";
