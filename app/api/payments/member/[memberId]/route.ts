import { z } from "zod";
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withApproval } from "@/lib/middleware/withApproval";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { toRange, buildMeta } from "@/lib/utils/pagination";
import { applySorting } from "@/lib/utils/query-builder";
import { createSupabaseServer } from "@/lib/supabase/server";
import { apiPaymentHistoryFilterSchema } from "@/features/payments/types/payment.schemas";

const uuidSchema = z.string().uuid();

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

export const GET = apiHandler(async (req: Request, ctx: unknown) => {
  const { memberId } = await (ctx as RouteContext).params;

  // 1. Validate memberId param
  const idCheck = uuidSchema.safeParse(memberId);
  if (!idCheck.success) {
    return errorResponse(ErrorCodes.INVALID_UUID, "Invalid member ID", 400);
  }

  // 2. Authenticate
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const approvalResult = await withApproval(authResult, req);
  if (approvalResult !== null) return approvalResult;

  const supabase = await createSupabaseServer(req);

  // 3. Role-based access check BEFORE data fetch (IDOR prevention)
  // profiles has no member_id column; check ownership via members.profile_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authResult.id)
    .single();

  const isTreasurer = profile?.role === "treasurer";

  if (!isTreasurer) {
    // Non-treasurer: verify the requested memberId belongs to the current user
    const { data: memberCheck } = await supabase
      .from("members")
      .select("profile_id")
      .eq("id", memberId)
      .single();

    if (memberCheck?.profile_id !== authResult.id) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Access denied", 403);
    }
  }

  // 4. Validate query params
  const { searchParams } = new URL(req.url);
  const parsed = validate(
    apiPaymentHistoryFilterSchema,
    Object.fromEntries(searchParams)
  );
  if (!parsed.success) return parsed.response;

  const { page, pageSize, sortBy, sortOrder, paymentType, year } = parsed.data;
  const { from, to } = toRange({ page, pageSize });

  // 5. Build query — only this member's payment records, joined with academic_periods
  //    so callers get periodMonth/periodYear (the month being COVERED, not when paid)
  let query = supabase
    .from("payment_records")
    .select("*, academic_periods!academic_period_id(month, year, label)", { count: "exact" })
    .eq("member_id", memberId)
    .range(from, to);

  if (paymentType) query = query.eq("payment_type", paymentType);
  if (year !== undefined) query = query.eq("year_ref", year);

  query = applySorting(query, sortBy ?? "payment_date", sortOrder, [
    "payment_date",
    "amount_paid",
  ]);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  // 6. Map rows (snake_case → camelCase)
  type PeriodJoin = { month: number; year: number; label: string } | null;

  const records = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    memberId: row.member_id,
    paymentType: row.payment_type,
    amountPaid: row.amount_paid,
    paymentDate: row.payment_date,
    academicPeriodId: row.academic_period_id ?? null,
    periodMonth: (row.academic_periods as PeriodJoin)?.month ?? null,
    periodYear: (row.academic_periods as PeriodJoin)?.year ?? null,
    periodLabel: (row.academic_periods as PeriodJoin)?.label ?? null,
    referenceNumber: row.reference_number ?? null,
    notes: row.notes ?? null,
    recordedBy: row.recorded_by,
    createdAt: row.created_at,
  }));

  return successResponse(records, buildMeta(count ?? 0, { page, pageSize }));
});
