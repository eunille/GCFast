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

  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;

  const supabase = await createSupabaseServer();

  // 2. All aggregation runs at the DB level — no JS reduce()
  const [
    membersResult,
    collectedResult,
    statusCountsResult,
    byCollegeResult,
  ] = await Promise.all([
    // Active member count
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    // Total collected: sum of all payment_records
    supabase
      .from("payment_records")
      .select("amount_paid.sum()"),

    // Members by payment status from the summary view
    supabase
      .from("member_payment_summary")
      .select("status, count:status.count()"),

    // Per-college collection breakdown
    // Fetch both paid columns; group in JS (bounded by member count — acceptable)
    supabase
      .from("member_payment_summary")
      .select("college_id, college_name, membership_fee_amount_paid, total_dues_paid"),
  ]);

  if (membersResult.error) throw new Error(membersResult.error.message);
  if (collectedResult.error) throw new Error(collectedResult.error.message);
  if (statusCountsResult.error) throw new Error(statusCountsResult.error.message);
  if (byCollegeResult.error) throw new Error(byCollegeResult.error.message);

  // 3. Parse status counts
  const statusRows = (statusCountsResult.data ?? []) as Array<{ status: string; count: number }>;
  const membersWithBalance = statusRows.find((r) => r.status === "HAS_BALANCE")?.count ?? 0;
  const membersComplete = statusRows.find((r) => r.status === "COMPLETE")?.count ?? 0;

  // 4. Parse total collected — Supabase aggregate .sum() returns { sum: number | null }[]
  type AggRow = { sum: number | null };
  const aggRow = ((collectedResult.data ?? []) as unknown as AggRow[])[0];
  const totalCollected = aggRow?.sum ?? 0;

  // 5. Map per-college breakdown
  //    outstanding_balance = amount OWED, not collected.
  //    Actual collected = membership_fee_amount_paid + total_dues_paid per member.
  type CollegeRow = {
    college_id: string;
    college_name: string;
    membership_fee_amount_paid: number | null;
    total_dues_paid: number | null;
  };
  const collegeMap = new Map<string, { collegeName: string; total: number; memberCount: number }>();
  for (const row of ((byCollegeResult.data ?? []) as unknown as CollegeRow[])) {
    const collected = (row.membership_fee_amount_paid ?? 0) + (row.total_dues_paid ?? 0);
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
