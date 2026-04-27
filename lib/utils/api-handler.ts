/**
 * API Handler Wrapper
 * 
 * Global error handler for all API routes.
 * Catches unhandled errors and prevents raw stack traces from leaking to clients.
 * 
 * Usage:
 * ```typescript
 * export const GET = apiHandler(async (req: Request) => {
 *   // Your route logic here
 *   return successResponse(data);
 * });
 * ```
 */

import { errorResponse } from "./api-response";
import { logRequest, logError } from "./logger";

export function apiHandler(
  handler: (req: Request, ctx?: unknown) => Promise<Response>
) {
  return async (req: Request, ctx?: unknown): Promise<Response> => {
    // Structured request log — no PII; userId resolved downstream by handlers
    logRequest(req);
    try {
      return await handler(req, ctx);
    } catch (err) {
      const path = new URL(req.url).pathname;
      logError(err, path);

      // Return generic error to client (no stack trace leak)
      return errorResponse(
        "INTERNAL_ERROR",
        "An unexpected error occurred",
        500
      );
    }
  };
}
