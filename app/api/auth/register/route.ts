import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withRateLimit } from "@/lib/middleware/withRateLimit";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  fullName: z.string().min(2).max(100).trim(),
  role: z.enum(["member", "treasurer"]),
});

export const POST = apiHandler(async (req: Request) => {
  // Rate limit: 5 registrations per 10 minutes per IP
  const rateLimited = withRateLimit(req, { limit: 5, windowMs: 10 * 60_000 });
  if (rateLimited) return rateLimited;

  // Validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }
  const validation = validate(registerSchema, body);
  if (!validation.success) return validation.response;

  const { email, password, fullName, role } = validation.data;

  const supabaseAdmin = getSupabaseAdmin();

  // Check if user already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const alreadyExists = existingUsers?.users?.some(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (alreadyExists) {
    return errorResponse(
      ErrorCodes.ALREADY_EXISTS,
      "An account with this email already exists.",
      409
    );
  }

  // Create user via Admin SDK — bypasses email confirmation rate limits.
  // email_confirm: true means the account is active immediately (no email needed).
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // Auto-link member record if one already exists with this email.
  // This handles the case where the Treasurer created a member record before
  // the member registered an auth account.
  if (role === "member") {
    const { data: existingMember } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (existingMember?.id) {
      await supabaseAdmin
        .from("members")
        .update({ profile_id: data.user.id })
        .eq("id", existingMember.id);
    }
  }

  return successResponse({ id: data.user.id, email: data.user.email }, undefined, 201);
});
