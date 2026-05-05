import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { toRange, buildMeta } from "@/lib/utils/pagination";
import { createSupabaseServer } from "@/lib/supabase/server";
import { apiRecordPaymentSchema } from "@/features/payments/types/payment.schemas";
import { z } from "zod";

/** PostgreSQL unique constraint violation code. */
const PG_UNIQUE_VIOLATION = "23505";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  memberId: z.string().uuid().optional(),
  paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]).optional(),
  collegeId: z.string().uuid().optional(),
});

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate + authorize (treasurer only)
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  // 2. Validate query params
  const { searchParams } = new URL(req.url);
  const parsed = validate(listQuerySchema, Object.fromEntries(searchParams));
  if (!parsed.success) return parsed.response;

  const { page, pageSize, memberId, paymentType, collegeId } = parsed.data;
  const { from, to } = toRange({ page, pageSize });

  const supabase = await createSupabaseServer(req);

  // 3. Query payment records — join members + academic_periods for display
  //    Use !inner join on members when filtering by college so unmatched rows are excluded
  const memberJoinType = collegeId ? "members!inner" : "members";

  let query = supabase
    .from("payment_records")
    .select(
      `*,
       ${memberJoinType}!member_id(id, full_name, email, college_id),
       academic_periods!academic_period_id(id, label)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (memberId) query = query.eq("member_id", memberId);
  if (paymentType) query = query.eq("payment_type", paymentType);
  if (collegeId) query = query.eq("members.college_id", collegeId);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  type MemberJoin = { id: string; full_name: string; email: string; college_id: string } | null;
  type PeriodJoin = { id: string; label: string } | null;

  const mapped = ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
    id: row.id,
    memberId: row.member_id,
    paymentType: row.payment_type,
    amountPaid: row.amount_paid,
    paymentDate: row.payment_date,
    academicPeriodId: row.academic_period_id ?? null,
    referenceNumber: row.reference_number ?? null,
    notes: row.notes ?? null,
    recordedBy: row.recorded_by,
    createdAt: row.created_at,
    // Joined fields
    memberName: (row.members as MemberJoin)?.full_name ?? "",
    memberEmail: (row.members as MemberJoin)?.email ?? "",
    periodLabel: (row.academic_periods as PeriodJoin)?.label ?? null,
  }));

  return successResponse(mapped, buildMeta(count ?? 0, { page, pageSize }));
});

export const POST = apiHandler(async (req: Request) => {
  // 1. Authenticate + authorize (treasurer only)
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  // 2. Validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(apiRecordPaymentSchema, body);
  if (!parsed.success) return parsed.response;

  const { memberId, paymentType, amountPaid, paymentDate, academicPeriodId, referenceNumber, notes } =
    parsed.data;

  const supabase = await createSupabaseServer(req);

  // 3. Verify member exists and is active
  const { data: member } = await supabase
    .from("members")
    .select("id, is_active")
    .eq("id", memberId)
    .single();

  if (!member || !member.is_active) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Member not found or inactive", 404);
  }

  // 4. For MONTHLY_DUES — verify academic period exists
  if (paymentType === "MONTHLY_DUES" && academicPeriodId) {
    const { count } = await supabase
      .from("academic_periods")
      .select("id", { count: "exact", head: true })
      .eq("id", academicPeriodId);

    if (!count || count === 0) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, "Academic period not found", 400);
    }
  }

  // 5. Insert — duplicate prevention is enforced by DB unique constraints.
  //    Unique constraints required on `payment_records`:
  //      - UNIQUE (member_id) WHERE payment_type = 'MEMBERSHIP_FEE'
  //      - UNIQUE (member_id, academic_period_id, payment_type) WHERE payment_type = 'MONTHLY_DUES'
  //    We catch constraint violation (PG 23505) and return 409 — eliminating TOCTOU race.
  const { data, error } = await supabase
    .from("payment_records")
    .insert({
      member_id: memberId,
      payment_type: paymentType,
      amount_paid: Math.round(amountPaid * 100) / 100, // round to 2 decimal places
      payment_date: paymentDate,
      academic_period_id: academicPeriodId ?? null,
      reference_number: referenceNumber ?? null,
      notes: notes ?? null,
      recorded_by: authResult.id,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === PG_UNIQUE_VIOLATION) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        "Payment already recorded for this member and period",
        409
      );
    }
    throw new Error(error.message);
  }

  // 6. Map response (snake_case → camelCase)
  const row = data as Record<string, unknown>;
  return successResponse(
    {
      id: row.id,
      memberId: row.member_id,
      paymentType: row.payment_type,
      amountPaid: row.amount_paid,
      paymentDate: row.payment_date,
      academicPeriodId: row.academic_period_id ?? null,
      referenceNumber: row.reference_number ?? null,
      notes: row.notes ?? null,
      recordedBy: row.recorded_by,
      createdAt: row.created_at,
    },
    undefined,
    201
  );
});
