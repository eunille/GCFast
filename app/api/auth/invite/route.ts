import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { withRateLimit } from "@/lib/middleware/withRateLimit";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100).trim(),
  memberId: z.string().uuid(),
});

export const POST = apiHandler(async (req: Request) => {
  // 0. Rate limit — 5 invites per 5 minutes per IP
  const rateLimited = withRateLimit(req, { limit: 5, windowMs: 5 * 60_000 });
  if (rateLimited) return rateLimited;

  // 1. Authenticate
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Enforce treasurer-only access
  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  // 3. Validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(inviteSchema, body);
  if (!parsed.success) return parsed.response;

  const { email, fullName, memberId } = parsed.data;

  // 4. Send invite email via Supabase Auth (service role required)
  const { error: inviteError } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name: fullName,
        member_id: memberId,
      },
    }
  );

  if (inviteError) {
    // Supabase returns 422 for already-registered users
    if (inviteError.message.toLowerCase().includes("already registered")) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        "A user with this email already exists",
        409
      );
    }
    throw new Error(inviteError.message);
  }

  return successResponse(
    { email, fullName, memberId },
    undefined,
    201
  );
});
