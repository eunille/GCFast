/**
 * Shared API Response Types
 * 
 * Type definitions for API responses across frontend/backend.
 * Ensures type safety when consuming API routes from React components.
 * 
 * Usage in frontend:
 * ```typescript
 * const response = await fetch("/api/members");
 * const json: ApiResponse<Member[]> = await response.json();
 * 
 * if (json.success) {
 *   // TypeScript knows json.data is Member[]
 *   console.log(json.data);
 * } else {
 *   // TypeScript knows json.error exists
 *   console.error(json.error.message);
 * }
 * ```
 */

import type { PaginationMeta } from "@/lib/utils/pagination";
import type { ErrorCode } from "./error-codes";

/**
 * Successful API response
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta; // Present on list endpoints
}

/**
 * Error API response
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown; // Field-level validation errors
  };
}

/**
 * Union type for all API responses
 * 
 * Use TypeScript discriminated unions to narrow type:
 * ```typescript
 * if (response.success) {
 *   // response is SuccessResponse<T>
 * } else {
 *   // response is ErrorResponse
 * }
 * ```
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
