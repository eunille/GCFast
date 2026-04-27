/**
 * API Response Helpers
 * 
 * Enforces consistent response envelope across all API routes per GFAST standards.
 * 
 * Every API response follows one of two shapes:
 * - Success: { success: true, data: ..., meta?: ... }
 * - Error: { success: false, error: { code, message, details? } }
 */

import type { PaginationMeta } from "./pagination";

/**
 * Return a successful API response
 * 
 * @param data - The response data (single object or array)
 * @param meta - Optional pagination metadata (for list endpoints)
 * @param status - HTTP status code (default: 200)
 * @returns Response object with consistent envelope
 */
export function successResponse(
  data: unknown,
  meta?: PaginationMeta,
  status = 200
): Response {
  return Response.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

/**
 * Return an error API response
 * 
 * @param code - Machine-readable error code (use ErrorCodes constants)
 * @param message - Human-readable error message
 * @param status - HTTP status code (400, 401, 403, 404, 409, 500, etc.)
 * @param details - Optional additional error details (e.g., field-level validation errors)
 * @returns Response object with consistent error envelope
 */
export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): Response {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
