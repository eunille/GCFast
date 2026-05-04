// app/api/dues-configurations/route.ts
// GET  — list dues configurations (all authenticated users)
// POST — add a new rate entry, closing the previous one (treasurer only)

import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  apiCreateDuesConfigSchema,
  apiDuesConfigFilterSchema,
} from "@/features/dues-configurations/types/dues-config.schemas";
import { mapDuesConfigRow } from "@/features/dues-configurations/repositories/dues-config.mapper";
import type { DuesConfigRow } from "@/features/dues-configurations/types/dues-config.types";

// ── GET /api/dues-configurations ────────────────────────────────────────────

export const GET = apiHandler(async (req: Request) => {
  // 1. Any authenticated user may view rates
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Validate query params
  const { searchParams } = new URL(req.url);
  const parsed = validate(
    apiDuesConfigFilterSchema,
    Object.fromEntries(searchParams)
  );
  if (!parsed.success) return parsed.response;

  const { paymentType, memberType, activeOnly } = parsed.data;

  // 3. Query
  const supabase = await createSupabaseServer(req);
  let query = supabase
    .from("dues_configurations")
    .select("id, payment_type, member_type, amount, effective_from, effective_until, created_at")
    .order("payment_type", { ascending: true })
    .order("member_type", { ascending: true })
    .order("effective_from", { ascending: false });

  if (paymentType) query = query.eq("payment_type", paymentType);
  if (memberType)  query = query.eq("member_type", memberType);
  if (activeOnly)  query = query.is("effective_until", null);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return successResponse((data as unknown as DuesConfigRow[]).map(mapDuesConfigRow));
});

// ── POST /api/dues-configurations ───────────────────────────────────────────

export const POST = apiHandler(async (req: Request) => {
  // 1. Treasurer only
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  // 2. Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(apiCreateDuesConfigSchema, body);
  if (!parsed.success) return parsed.response;

  const { paymentType, memberType, amount, effectiveFrom } = parsed.data;

  const supabase = await createSupabaseServer(req);

  // 3. Check if a rate with the same effective_from already exists for this type combo.
  //    If it does (same-day update scenario), just update its amount in place — no new row needed.
  const { data: sameDay } = await supabase
    .from("dues_configurations")
    .select("id, payment_type, member_type, amount, effective_from, effective_until, created_at")
    .eq("payment_type", paymentType)
    .eq("member_type", memberType)
    .eq("effective_from", effectiveFrom)
    .maybeSingle();

  if (sameDay) {
    const { data: updated, error: updateError } = await supabase
      .from("dues_configurations")
      .update({ amount })
      .eq("id", sameDay.id)
      .select("id, payment_type, member_type, amount, effective_from, effective_until, created_at")
      .single();

    if (updateError) throw new Error(updateError.message);
    return successResponse(mapDuesConfigRow(updated as unknown as DuesConfigRow));
  }

  // 4. Close the current active rate (set effective_until to effectiveFrom - 1 day)
  await supabase
    .from("dues_configurations")
    .update({
      effective_until: new Date(
        new Date(effectiveFrom).getTime() - 86_400_000 // -1 day
      )
        .toISOString()
        .slice(0, 10),
    })
    .eq("payment_type", paymentType)
    .eq("member_type", memberType)
    .is("effective_until", null);

  // 5. Insert new rate
  const { data: newRow, error: insertError } = await supabase
    .from("dues_configurations")
    .insert({
      payment_type: paymentType,
      member_type: memberType,
      amount,
      effective_from: effectiveFrom,
      created_by: authResult.id,
    })
    .select("id, payment_type, member_type, amount, effective_from, effective_until, created_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return errorResponse(ErrorCodes.CONFLICT, "Rate already exists for this period", 409);
    }
    throw new Error(insertError.message);
  }

  return successResponse(mapDuesConfigRow(newRow as unknown as DuesConfigRow), undefined, 201);
});
