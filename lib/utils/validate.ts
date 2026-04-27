/**
 * Zod Validation Helper
 * 
 * Reusable validation wrapper that validates data against a Zod schema
 * and returns either clean data or a formatted error response.
 * 
 * Usage:
 * ```typescript
 * const parsed = validate(createMemberSchema, await req.json());
 * if (!parsed.success) return parsed.response;
 * 
 * // Type-safe access to validated data
 * const { fullName, email } = parsed.data;
 * ```
 */

import { type ZodSchema } from "zod";
import { errorResponse } from "./api-response";
import { ErrorCodes } from "@/lib/types/error-codes";

/**
 * Validate data against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Either { success: true, data: T } or { success: false, response: Response }
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      response: errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid request data",
        400,
        result.error.flatten().fieldErrors
      ),
    };
  }

  return { success: true, data: result.data };
}
