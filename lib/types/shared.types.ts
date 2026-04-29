// lib/types/shared.types.ts
// Re-exports shared reference types from lib/models.
// Additional pagination/sort helpers used internally by repositories are defined here.

export type { College, AcademicPeriod } from "@/lib/models";
export type { MemberType, PaymentStatus, PaymentType, PaginationMeta } from "@/lib/models";

// Internal pagination helpers — not API models, used by repository/query-builder layer only.
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SortDirection = "asc" | "desc";

export interface SortParams {
  field: string;
  direction: SortDirection;
}
