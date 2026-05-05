import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withApproval } from "@/lib/middleware/withApproval";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate (any role) and verify approval status.
  //    Both checks read live from the DB — no stale JWT data used for access control.
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const approvalResult = await withApproval(authResult, req);
  if (approvalResult !== null) return approvalResult;

  // Use admin client for all subsequent reads.
  // Auth + approval already verified above; admin bypasses RLS so self-registered
  // members (college_id = null, no pre-linked record) are still found correctly.
  const supabase = getSupabaseAdmin();

  // 2. Resolve member_id — profile_id fast path, then email fallback.
  let memberId: string | null = null;

  const { data: byProfile } = await supabase
    .from("members")
    .select("id")
    .eq("profile_id", authResult.id)
    .eq("is_active", true)
    .maybeSingle();

  if (byProfile?.id) {
    memberId = byProfile.id;
  } else if (authResult.email) {
    // Fallback: account existed before invite flow — find by email and auto-link.
    const { data: byEmail } = await supabase
      .from("members")
      .select("id")
      .eq("email", authResult.email)
      .eq("is_active", true)
      .maybeSingle();

    if (byEmail?.id) {
      memberId = byEmail.id;
      // Auto-link so the profile_id lookup succeeds next time.
      await supabase
        .from("members")
        .update({ profile_id: authResult.id })
        .eq("id", memberId);
    }
  }

  if (!memberId) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      "No member record linked to this account",
      404
    );
  }

  // 3. Query member_payment_summary view for own record only.
  //    Uses maybeSingle() — new members with no payments yield no view row; handled below.
  const { data } = await supabase
    .from("member_payment_summary")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (!data) {
    // New member with no payments yet (or college_id still null before migration runs).
    // Return a zeroed standing so the dashboard renders without error.
    const { data: member } = await supabase
      .from("members")
      .select("id, full_name, member_type, college_id, colleges(name)")
      .eq("id", memberId)
      .maybeSingle();

    if (!member) {
      return errorResponse(ErrorCodes.NOT_FOUND, "Member record not found", 404);
    }

    type MemberRow = {
      id: string;
      full_name: string;
      member_type: string;
      college_id: string | null;
      colleges: { name: string }[] | { name: string } | null;
    };
    const row = member as unknown as MemberRow;
    const collegeObj = Array.isArray(row.colleges) ? row.colleges[0] : row.colleges;

    return successResponse({
      memberId: row.id,
      fullName: row.full_name,
      college: collegeObj?.name ?? null,
      memberType: row.member_type,
      membershipFeePaid: false,
      periodsExpected: 0,
      periodsPaid: 0,
      monthsPaid: [],
      outstandingBalance: 0,
      status: "HAS_BALANCE",
      lastPaymentDate: null,
    });
  }

  // 4. Map summary view row (snake_case → camelCase).
  const row = data as Record<string, unknown>;
  return successResponse({
    memberId: row.member_id,
    fullName: row.full_name,
    college: row.college_name ?? null,
    memberType: row.member_type,
    membershipFeePaid: row.membership_fee_paid ?? false,
    periodsExpected: row.periods_expected ?? 0,
    periodsPaid: row.periods_paid ?? 0,
    monthsPaid: row.months_paid ?? [],
    outstandingBalance: row.outstanding_balance ?? 0,
    status: row.status ?? "HAS_BALANCE",
    lastPaymentDate: row.last_payment_date ?? null,
  });
});
