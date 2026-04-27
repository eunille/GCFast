// features/reports/repositories/report.repository.ts
// Layer 2 — DATA: Only layer that calls Supabase for reports. No JSX. No React hooks.

import { supabase } from "@/lib/supabase/client";
import type { ReportFilter, ReportRow } from "../types/report.types";

function mapReportRowFromDb(row: Record<string, unknown>): ReportRow {
  return {
    memberId:          String(row.member_id),
    memberName:        String(row.member_name),
    college:           String(row.college_name ?? row.college ?? ""),
    totalPaid:         Number(row.total_paid ?? 0),
    outstandingBalance: Number(row.outstanding_balance ?? 0),
    monthsPaid:        Array.isArray(row.months_paid) ? (row.months_paid as number[]) : [],
    membershipFeePaid: Boolean(row.membership_fee_paid),
  };
}

export const reportRepository = {
  async generate(filter: ReportFilter): Promise<ReportRow[]> {
    let query = supabase
      .from("member_payment_summary")
      .select("*")
      .eq("year_ref", filter.yearRef);

    if (filter.collegeId) {
      query = query.eq("college_id", filter.collegeId);
    }

    if (filter.monthRef) {
      // Filter members who have NOT paid the given month
      if (filter.type === "OUTSTANDING_BALANCE") {
        query = query.not("months_paid", "cs", `{${filter.monthRef}}`);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as Record<string, unknown>[]).map(mapReportRowFromDb);
  },
};
