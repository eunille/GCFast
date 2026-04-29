// lib/models/shared.models.ts
// Source of truth: API_MODELS.md — "Shared Types & Enums" + "Standard Response Envelope"

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Role as returned by the API (lowercase, from profiles table) */
export type ApiUserRole = "treasurer" | "member";

/** Role used client-side in auth hooks (uppercase, from user_metadata) */
export type UserRole = "MEMBER" | "TREASURER" | "ADMIN";

export type MemberType    = "FULL_TIME" | "ASSOCIATE";
export type PaymentStatus = "COMPLETE" | "HAS_BALANCE";
export type PaymentType   = "MEMBERSHIP_FEE" | "MONTHLY_DUES";
export type ReportFormat  = "json" | "excel" | "pdf";

// ─── Response Envelope ────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
