import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerateReportInput } from "@/features/reports/types/report.schemas";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ReportMemberRow {
  memberId: string;
  fullName: string;
  collegeName: string;
  memberType: string;
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  outstandingBalance: number;
  status: string;
  lastPaymentDate: string | null;
}

export interface ReportData {
  generatedAt: string;
  year: number;
  college: string;
  totalMembers: number;
  totalCollected: number;
  members: ReportMemberRow[];
}

// ─── Data builder ───────────────────────────────────────────────────────────

function mapReportRow(row: Record<string, unknown>): ReportMemberRow {
  return {
    memberId: row.member_id as string,
    fullName: row.full_name as string,
    collegeName: (row.college_name as string) ?? "",
    memberType: (row.member_type as string) ?? "",
    membershipFeePaid: Boolean(row.membership_fee_paid),
    periodsExpected: Number(row.periods_expected ?? 0),
    periodsPaid: Number(row.periods_paid ?? 0),
    outstandingBalance: Number(row.outstanding_balance ?? 0),
    status: (row.status as string) ?? "HAS_BALANCE",
    lastPaymentDate: (row.last_payment_date as string | null) ?? null,
  };
}

export async function buildReportData(
  input: GenerateReportInput,
  supabase: SupabaseClient,
): Promise<ReportData> {
  let query = supabase
    .from("member_payment_summary")
    .select("*")
    .order("college_name")
    .order("full_name");

  if (input.collegeId) query = query.eq("college_id", input.collegeId);
  if (input.startDate) query = query.gte("last_payment_date", input.startDate);
  if (input.endDate) query = query.lte("last_payment_date", input.endDate);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Record<string, unknown>[];
  const members = rows.map(mapReportRow);

  const totalCollected = rows.reduce(
    (sum, r) =>
      sum +
      Number(r.membership_fee_amount_paid ?? 0) +
      Number(r.total_dues_paid ?? 0),
    0,
  );

  const collegeName =
    input.collegeId && rows[0]
      ? (rows[0].college_name as string)
      : "All Colleges";

  return {
    generatedAt: new Date().toISOString(),
    year: input.year,
    college: collegeName,
    totalMembers: members.length,
    totalCollected,
    members,
  };
}
