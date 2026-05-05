import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { successResponse } from "@/lib/utils/api-response";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { TreasurerDashboard } from "@/lib/models";

// Cache this aggregation for 60 seconds — heavy query, data changes infrequently
export const revalidate = 60;

/** Returns "YYYY-MM" for the current month, offset by `delta` months (negative = past). */
function yearMonth(delta = 0): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  return d.toISOString().slice(0, 7);
}
/** Short month label from "YYYY-MM" e.g. "Jan" */
function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "short" });
}

export const GET = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;
  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  const supabase = await createSupabaseServer(req);

  // ── 1. Current member summary (all active members) ─────────────────────────
  const [membersResult, summaryResult] = await Promise.all([
    supabase
      .from("members")
      .select("id, joined_at", { count: "exact" })
      .eq("is_active", true),
    supabase
      .from("member_payment_summary")
      .select("status, college_id, college_name, membership_fee_amount_paid, total_dues_paid, outstanding_balance"),
  ]);

  if (membersResult.error) throw new Error(membersResult.error.message);
  if (summaryResult.error) throw new Error(summaryResult.error.message);

  type MemberRow = { id: string; joined_at: string | null };
  type SummaryRow = {
    status: string; college_id: string; college_name: string;
    membership_fee_amount_paid: number | null;
    total_dues_paid: number | null;
    outstanding_balance: number | null;
  };

  const memberRows = (membersResult.data ?? []) as MemberRow[];
  const rows = (summaryResult.data ?? []) as SummaryRow[];
  const totalMembers = membersResult.count ?? 0;

  // ── 2. Monthly trend — last 6 months of payment_records ────────────────────
  const sixMonthsAgo = yearMonth(-5).concat("-01"); // first day of 6 months ago
  const { data: trendData, error: trendError } = await supabase
    .from("payment_records")
    .select("amount_paid, payment_date")
    .gte("payment_date", sixMonthsAgo);
  if (trendError) throw new Error(trendError.message);

  type TrendRow = { amount_paid: number; payment_date: string };
  const trendRows = (trendData ?? []) as TrendRow[];

  // Build month bucket for last 6 months (oldest first)
  const trendMap = new Map<string, number>();
  for (let i = -5; i <= 0; i++) {
    const ym = yearMonth(i);
    trendMap.set(ym, 0);
  }
  for (const t of trendRows) {
    const ym = t.payment_date.slice(0, 7);
    if (trendMap.has(ym)) trendMap.set(ym, (trendMap.get(ym)! + Number(t.amount_paid)));
  }
  const monthlyTrend = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, total]) => ({ yearMonth: ym, label: monthLabel(ym), totalCollected: Math.round(total * 100) / 100 }));

  // ── 3. Current-month vs last-month change ───────────────────────────────────
  const thisMonth = yearMonth(0);
  const lastMonth = yearMonth(-1);
  const thisMonthTotal = trendMap.get(thisMonth) ?? 0;
  const lastMonthTotal = trendMap.get(lastMonth) ?? 0;
  const collectedChange = lastMonthTotal > 0 ? thisMonthTotal - lastMonthTotal : null;

  // ── 4. Aggregate summary rows ───────────────────────────────────────────────
  let totalCollected = 0;
  let membersWithBalance = 0;
  let membersComplete = 0;
  let totalOutstanding = 0;
  const collegeMap = new Map<string, { collegeName: string | null; collegeId: string | null; total: number; memberCount: number }>();

  for (const row of rows) {
    const collected = (row.membership_fee_amount_paid ?? 0) + (row.total_dues_paid ?? 0);
    totalCollected += collected;
    totalOutstanding += row.outstanding_balance ?? 0;

    if (row.status === "HAS_BALANCE") membersWithBalance++;
    else if (row.status === "COMPLETE") membersComplete++;

    const mapKey = row.college_id ?? "__no_college__";
    const existing = collegeMap.get(mapKey);
    if (existing) { existing.total += collected; existing.memberCount++; }
    else collegeMap.set(mapKey, { collegeId: row.college_id ?? null, collegeName: row.college_name ?? null, total: collected, memberCount: 1 });
  }

  // ── 5. College distribution with percentages ────────────────────────────────
  const collectionByCollege = Array.from(collegeMap.values())
    .map((d) => ({
      collegeId: d.collegeId, collegeName: d.collegeName,
      total: Math.round(d.total * 100) / 100,
      memberCount: d.memberCount,
      percent: totalCollected > 0 ? Math.round((d.total / totalCollected) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // ── 6. New members this month ───────────────────────────────────────────────
  const thisMonthPrefix = thisMonth + "-";
  const newMembersThisMonth = memberRows.filter(
    (m) => m.joined_at && m.joined_at.startsWith(thisMonthPrefix)
  ).length;

  // ── 7. Collection rate change (rough: current complete% vs if last month collected more) ──
  const currentRate = totalMembers > 0 ? Math.round((membersComplete / totalMembers) * 100) : 0;
  const collectionRateChange = lastMonthTotal > 0 && thisMonthTotal > 0
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 * 10) / 10
    : null;

  const dashboard: TreasurerDashboard = {
    totalMembers,
    totalCollected: Math.round(totalCollected * 100) / 100,
    membersWithBalance,
    membersComplete,
    collectedChange: collectedChange !== null ? Math.round(collectedChange * 100) / 100 : null,
    collectionRateChange,
    newMembersThisMonth,
    outstandingChange: null, // would require historical snapshot — N/A for now
    monthlyTrend,
    collectionByCollege,
  };

  return successResponse(dashboard);
});

