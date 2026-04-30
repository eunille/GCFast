import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerateReportInput } from "@/features/reports/types/report.schemas";

// ─── Exported types (consumed by excel/pdf services and API route) ────────────

export interface CollegeBreakdownRow {
  collegeId: string; collegeName: string;
  totalMembers: number; membersPaid: number;
  totalCollected: number; outstanding: number; collectionRate: number;
}
export interface PaymentSummaryReport {
  reportType: "payment_summary"; generatedAt: string;
  startDate: string; endDate: string; collegeScope: string;
  totalCollected: number; outstanding: number;
  totalMembers: number; membersPaid: number;
  membersPaidPercent: number; avgCollectionPerMember: number;
  breakdown: CollegeBreakdownRow[];
}
export interface OutstandingMemberRow {
  memberId: string; fullName: string; collegeName: string; memberType: string;
  outstandingBalance: number; periodsExpected: number; periodsPaid: number;
}
export interface OutstandingBalanceReport {
  reportType: "outstanding_balance"; generatedAt: string;
  startDate: string; endDate: string; collegeScope: string;
  totalOutstanding: number; membersWithBalance: number; totalMembers: number;
  members: OutstandingMemberRow[];
}
export interface MembershipStatusRow {
  collegeId: string; collegeName: string;
  totalMembers: number; complete: number; hasBalance: number; completePercent: number;
}
export interface MembershipStatusReport {
  reportType: "membership_status"; generatedAt: string;
  startDate: string; endDate: string; collegeScope: string;
  totalMembers: number; totalComplete: number; totalHasBalance: number;
  overallCompletePercent: number; breakdown: MembershipStatusRow[];
}
export interface MonthlyCollectionRow {
  yearMonth: string; label: string;
  totalCollected: number; paymentCount: number; uniqueMembers: number;
}
export interface MonthlyCollectionReport {
  reportType: "monthly_collection"; generatedAt: string;
  startDate: string; endDate: string; collegeScope: string;
  totalCollected: number; months: MonthlyCollectionRow[];
}
export interface MemberStandingRow {
  memberId: string; fullName: string; collegeName: string; memberType: string;
  membershipFeePaid: boolean; periodsPaid: number; periodsExpected: number;
  outstandingBalance: number; status: string;
}
export interface MemberStandingReport {
  reportType: "member_standing"; generatedAt: string;
  startDate: string; endDate: string; collegeScope: string;
  totalMembers: number; totalComplete: number; totalHasBalance: number;
  members: MemberStandingRow[];
}

export type ReportResult =
  | PaymentSummaryReport | OutstandingBalanceReport | MembershipStatusReport
  | MonthlyCollectionReport | MemberStandingReport;

/** @deprecated alias */
export type ReportData = ReportResult;

// ─── Internal row type from member_payment_summary ────────────────────────────

type SRow = {
  member_id: string; full_name: string; college_id: string; college_name: string;
  member_type: string; outstanding_balance: number; periods_paid: number;
  periods_expected: number; membership_fee_paid: boolean; status: string;
};

// ─── payment_summary ──────────────────────────────────────────────────────────

async function buildPaymentSummary(
  input: GenerateReportInput,
  supabase: SupabaseClient
): Promise<PaymentSummaryReport> {
  let sq = supabase
    .from("member_payment_summary")
    .select("member_id, college_id, college_name, outstanding_balance");
  if (input.collegeId) sq = sq.eq("college_id", input.collegeId);
  const { data: sData, error: sErr } = await sq;
  if (sErr) throw new Error(sErr.message);

  const sRows = (sData ?? []) as Array<{ member_id: string; college_id: string; college_name: string; outstanding_balance: number }>;
  const memberIds = sRows.map(r => r.member_id);
  let payments: Array<{ member_id: string; amount_paid: number }> = [];

  if (memberIds.length > 0) {
    const { data: pData, error: pErr } = await supabase
      .from("payment_records")
      .select("member_id, amount_paid")
      .gte("payment_date", input.startDate)
      .lte("payment_date", input.endDate)
      .in("member_id", memberIds);
    if (pErr) throw new Error(pErr.message);
    payments = (pData ?? []) as typeof payments;
  }

  const memberCollegeMap = new Map(sRows.map(r => [r.member_id, { collegeId: r.college_id, collegeName: r.college_name }]));

  type PayAgg = { totalCollected: number; paidIds: Set<string> };
  const payByCollege = new Map<string, PayAgg>();
  for (const p of payments) {
    const info = memberCollegeMap.get(p.member_id);
    if (!info) continue;
    if (!payByCollege.has(info.collegeId)) payByCollege.set(info.collegeId, { totalCollected: 0, paidIds: new Set() });
    const agg = payByCollege.get(info.collegeId)!;
    agg.totalCollected += Number(p.amount_paid);
    agg.paidIds.add(p.member_id);
  }

  type MemAgg = { collegeName: string; memberIds: Set<string>; totalOutstanding: number };
  const memByCollege = new Map<string, MemAgg>();
  for (const r of sRows) {
    if (!memByCollege.has(r.college_id)) memByCollege.set(r.college_id, { collegeName: r.college_name, memberIds: new Set(), totalOutstanding: 0 });
    const agg = memByCollege.get(r.college_id)!;
    agg.memberIds.add(r.member_id);
    agg.totalOutstanding += Number(r.outstanding_balance);
  }

  const breakdown: CollegeBreakdownRow[] = [];
  for (const [collegeId, mAgg] of memByCollege) {
    const pAgg = payByCollege.get(collegeId);
    const totalCollected = pAgg?.totalCollected ?? 0;
    const membersPaid = pAgg?.paidIds.size ?? 0;
    const outstanding = mAgg.totalOutstanding;
    const rateBase = totalCollected + outstanding;
    breakdown.push({ collegeId, collegeName: mAgg.collegeName, totalMembers: mAgg.memberIds.size, membersPaid, totalCollected, outstanding, collectionRate: rateBase > 0 ? Math.round((totalCollected / rateBase) * 100) : 0 });
  }
  breakdown.sort((a, b) => a.collegeName.localeCompare(b.collegeName));

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount_paid), 0);
  const totalMembers = sRows.length;
  const membersPaid = new Set(payments.map(p => p.member_id)).size;
  const outstanding = sRows.reduce((s, r) => s + Number(r.outstanding_balance), 0);
  const membersPaidPercent = totalMembers > 0 ? Math.round((membersPaid / totalMembers) * 100) : 0;

  return {
    reportType: "payment_summary",
    generatedAt: new Date().toISOString(),
    startDate: input.startDate, endDate: input.endDate,
    collegeScope: input.collegeId && sRows[0] ? sRows[0].college_name : "All Colleges",
    totalCollected, outstanding, totalMembers, membersPaid, membersPaidPercent,
    avgCollectionPerMember: membersPaid > 0 ? totalCollected / membersPaid : 0,
    breakdown,
  };
}

// ─── outstanding_balance ──────────────────────────────────────────────────────

async function buildOutstandingBalance(
  input: GenerateReportInput,
  supabase: SupabaseClient
): Promise<OutstandingBalanceReport> {
  let q = supabase
    .from("member_payment_summary")
    .select("member_id, full_name, college_id, college_name, member_type, outstanding_balance, periods_expected, periods_paid");
  if (input.collegeId) q = q.eq("college_id", input.collegeId);
  const { data, error } = await q.order("outstanding_balance", { ascending: false }).order("college_name");
  if (error) throw new Error(error.message);

  const allRows = (data ?? []) as Array<SRow>;
  const members: OutstandingMemberRow[] = allRows
    .filter(r => Number(r.outstanding_balance) > 0)
    .map(r => ({
      memberId: r.member_id, fullName: r.full_name, collegeName: r.college_name,
      memberType: r.member_type, outstandingBalance: Number(r.outstanding_balance),
      periodsExpected: Number(r.periods_expected ?? 0), periodsPaid: Number(r.periods_paid ?? 0),
    }));

  return {
    reportType: "outstanding_balance",
    generatedAt: new Date().toISOString(),
    startDate: input.startDate, endDate: input.endDate,
    collegeScope: input.collegeId && allRows[0] ? allRows[0].college_name : "All Colleges",
    totalOutstanding: members.reduce((s, m) => s + m.outstandingBalance, 0),
    membersWithBalance: members.length,
    totalMembers: allRows.length,
    members,
  };
}

// ─── membership_status ────────────────────────────────────────────────────────

async function buildMembershipStatus(
  input: GenerateReportInput,
  supabase: SupabaseClient
): Promise<MembershipStatusReport> {
  let q = supabase.from("member_payment_summary").select("college_id, college_name, status");
  if (input.collegeId) q = q.eq("college_id", input.collegeId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{ college_id: string; college_name: string; status: string }>;

  const byCollege = new Map<string, { collegeName: string; total: number; complete: number; hasBalance: number }>();
  for (const r of rows) {
    if (!byCollege.has(r.college_id)) byCollege.set(r.college_id, { collegeName: r.college_name, total: 0, complete: 0, hasBalance: 0 });
    const agg = byCollege.get(r.college_id)!;
    agg.total++;
    if (r.status === "COMPLETE") agg.complete++; else agg.hasBalance++;
  }

  const breakdown: MembershipStatusRow[] = [...byCollege.entries()]
    .map(([collegeId, agg]) => ({
      collegeId, collegeName: agg.collegeName, totalMembers: agg.total,
      complete: agg.complete, hasBalance: agg.hasBalance,
      completePercent: agg.total > 0 ? Math.round((agg.complete / agg.total) * 100) : 0,
    }))
    .sort((a, b) => a.collegeName.localeCompare(b.collegeName));

  const totalComplete = breakdown.reduce((s, r) => s + r.complete, 0);
  const totalHasBalance = breakdown.reduce((s, r) => s + r.hasBalance, 0);
  const totalMembers = rows.length;

  return {
    reportType: "membership_status",
    generatedAt: new Date().toISOString(),
    startDate: input.startDate, endDate: input.endDate,
    collegeScope: input.collegeId && rows[0] ? rows[0].college_name : "All Colleges",
    totalMembers, totalComplete, totalHasBalance,
    overallCompletePercent: totalMembers > 0 ? Math.round((totalComplete / totalMembers) * 100) : 0,
    breakdown,
  };
}

// ─── monthly_collection ───────────────────────────────────────────────────────

async function buildMonthlyCollection(
  input: GenerateReportInput,
  supabase: SupabaseClient
): Promise<MonthlyCollectionReport> {
  let memberIds: string[] | null = null;
  let collegeScope = "All Colleges";

  if (input.collegeId) {
    const { data: mData, error: mErr } = await supabase
      .from("member_payment_summary")
      .select("member_id, college_name")
      .eq("college_id", input.collegeId);
    if (mErr) throw new Error(mErr.message);
    const mRows = (mData ?? []) as Array<{ member_id: string; college_name: string }>;
    memberIds = mRows.map(r => r.member_id);
    collegeScope = mRows[0]?.college_name ?? "Selected College";
    if (memberIds.length === 0) {
      return { reportType: "monthly_collection", generatedAt: new Date().toISOString(), startDate: input.startDate, endDate: input.endDate, collegeScope, totalCollected: 0, months: [] };
    }
  }

  let q = supabase
    .from("payment_records")
    .select("amount_paid, payment_date, member_id")
    .gte("payment_date", input.startDate)
    .lte("payment_date", input.endDate);
  if (memberIds) q = q.in("member_id", memberIds);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{ amount_paid: number; payment_date: string; member_id: string }>;

  const byMonth = new Map<string, { total: number; count: number; members: Set<string> }>();
  for (const r of rows) {
    const ym = r.payment_date.slice(0, 7);
    if (!byMonth.has(ym)) byMonth.set(ym, { total: 0, count: 0, members: new Set() });
    const agg = byMonth.get(ym)!;
    agg.total += Number(r.amount_paid);
    agg.count++;
    agg.members.add(r.member_id);
  }

  const months: MonthlyCollectionRow[] = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, agg]) => {
      const [y, m] = ym.split("-").map(Number);
      const label = new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "long", year: "numeric" });
      return { yearMonth: ym, label, totalCollected: agg.total, paymentCount: agg.count, uniqueMembers: agg.members.size };
    });

  return {
    reportType: "monthly_collection",
    generatedAt: new Date().toISOString(),
    startDate: input.startDate, endDate: input.endDate, collegeScope,
    totalCollected: rows.reduce((s, r) => s + Number(r.amount_paid), 0),
    months,
  };
}

// ─── member_standing ──────────────────────────────────────────────────────────

async function buildMemberStanding(
  input: GenerateReportInput,
  supabase: SupabaseClient
): Promise<MemberStandingReport> {
  let q = supabase
    .from("member_payment_summary")
    .select("member_id, full_name, college_id, college_name, member_type, membership_fee_paid, periods_paid, periods_expected, outstanding_balance, status");
  if (input.collegeId) q = q.eq("college_id", input.collegeId);
  const { data, error } = await q.order("college_name").order("full_name");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<SRow>;
  const members: MemberStandingRow[] = rows.map(r => ({
    memberId: r.member_id, fullName: r.full_name, collegeName: r.college_name,
    memberType: r.member_type, membershipFeePaid: Boolean(r.membership_fee_paid),
    periodsPaid: Number(r.periods_paid ?? 0), periodsExpected: Number(r.periods_expected ?? 0),
    outstandingBalance: Number(r.outstanding_balance ?? 0), status: r.status,
  }));

  const totalComplete = members.filter(m => m.status === "COMPLETE").length;

  return {
    reportType: "member_standing",
    generatedAt: new Date().toISOString(),
    startDate: input.startDate, endDate: input.endDate,
    collegeScope: input.collegeId && rows[0] ? rows[0].college_name : "All Colleges",
    totalMembers: members.length,
    totalComplete,
    totalHasBalance: members.length - totalComplete,
    members,
  };
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export async function buildReportData(
  input: GenerateReportInput,
  supabase: SupabaseClient
): Promise<ReportResult> {
  switch (input.reportType) {
    case "payment_summary":     return buildPaymentSummary(input, supabase);
    case "outstanding_balance": return buildOutstandingBalance(input, supabase);
    case "membership_status":   return buildMembershipStatus(input, supabase);
    case "monthly_collection":  return buildMonthlyCollection(input, supabase);
    case "member_standing":     return buildMemberStanding(input, supabase);
  }
}

