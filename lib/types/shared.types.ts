// lib/types/shared.types.ts
// Layer 1 — DOMAIN: Shared global types used across multiple features

export interface College {
  id: string;
  name: string;
  code: string;
}

export interface AcademicPeriod {
  id: string;
  label: string;
  month: number;
  year: number;
  isActive: boolean;
}

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
