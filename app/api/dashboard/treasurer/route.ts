import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { successResponse } from "@/lib/utils/api-response";
import { createSupabaseServer } from "@/lib/supabase/server";

// Cache this aggregation for 60 seconds — heavy query, data changes infrequently
export const revalidate = 60;

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate + authorize (treasurer only)
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  const supabase = await createSupabaseServer(req);

  // 2. Single query: fetch all summary rows from the view.
  //    Aggregate functions (PostgREST .sum()/.count()) are disabled on this project.
  //    The view already computes per-member totals; we aggregate in JS (bounded by member count).
  const [membersResult, summaryResult] = await Promise.all([
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("member_payment_summary")
      .select("status, college_id, college_name, membership_fee_amount_paid, total_dues_paid"),
  ]);

  if (membersResult.error) throw new Error(membersResult.error.message);
  if (summaryResult.error) throw new Error(summaryResult.error.message);

  type SummaryRow = {
    status: string;
    college_id: string;
    college_name: string;
    membership_fee_amount_paid: number | null;
    total_dues_paid: number | null;
  };
  const rows = (summaryResult.data ?? []) as SummaryRow[];

  // 3. Aggregate in JS — all bounded by active member count
  let totalCollected = 0;
  let membersWithBalance = 0;
  let membersComplete = 0;
  const collegeMap = new Map<string, { collegeName: string; total: number; memberCount: number }>();

  for (const row of rows) {
    const collected = (row.membership_fee_amount_paid ?? 0) + (row.total_dues_paid ?? 0);
    totalCollected += collected;

    if (row.status === "HAS_BALANCE") membersWithBalance += 1;
    else if (row.status === "COMPLETE") membersComplete += 1;

    const existing = collegeMap.get(row.college_id);
    if (existing) {
      existing.total += collected;
      existing.memberCount += 1;
    } else {
      collegeMap.set(row.college_id, {
        collegeName: row.college_name,
        total: collected,
        memberCount: 1,
      });
    }
  }

  const collectionByCollege = Array.from(collegeMap.entries()).map(([collegeId, d]) => ({
    collegeId,
    collegeName: d.collegeName,
    total: Math.round(d.total * 100) / 100,
    memberCount: d.memberCount,
  }));

  return successResponse({
    totalMembers: membersResult.count ?? 0,
    totalCollected,
    membersWithBalance,
    membersComplete,
    collectionByCollege,
  });
});
