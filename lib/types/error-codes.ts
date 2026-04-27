/**
 * Centralized Error Codes
 * 
 * Machine-readable error codes for consistent error handling across API routes.
 * Use these constants instead of magic strings to prevent typos.
 */

export const ErrorCodes = {
  // Authentication & Authorization (401, 403)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation (400, 422)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_UUID: "INVALID_UUID",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",

  // Resources (404, 409)
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Rate Limiting (429)
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Server (500, 503)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
