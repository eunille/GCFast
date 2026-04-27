import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate (any role)
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const supabase = await createSupabaseServer();

  // 2. Resolve member_id via profile — explicit auth user ID filter (IDOR prevention)
  const { data: profile } = await supabase
    .from("profiles")
    .select("member_id, role")
    .eq("id", authResult.id)
    .single();

  if (!profile?.member_id) {
    return errorResponse(
      ErrorCodes.NOT_FOUND,
      "No member record linked to this account",
      404
    );
  }

  // 3. Query member_payment_summary view for own record only
  const { data, error } = await supabase
    .from("member_payment_summary")
    .select("*")
    .eq("member_id", profile.member_id)
    .single();

  if (error || !data) {
    // New member with no payments yet — return zeroed standing
    const { data: member } = await supabase
      .from("members")
      .select("id, full_name, member_type, colleges(name)")
      .eq("id", profile.member_id)
      .single();

    if (!member) {
      return errorResponse(ErrorCodes.NOT_FOUND, "Member record not found", 404);
    }

    type MemberRow = {
      id: string;
      full_name: string;
      member_type: string;
      colleges: { name: string }[] | { name: string } | null;
    };
    const row = member as unknown as MemberRow;
    // Supabase returns joined one-to-one as array — normalise to single object
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

  // 4. Map summary view row (snake_case → camelCase)
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
