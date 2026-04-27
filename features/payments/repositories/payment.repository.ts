// features/payments/repositories/payment.repository.ts
// Layer 2 — DATA: Only layer that calls Supabase. No JSX. No React hooks.

import { supabase } from "@/lib/supabase/client";
import { mapPaymentFromDb, mapPaymentSummaryFromDb } from "./payment.mapper";
import type { Payment, MemberPaymentSummary } from "../types/payment.types";
import type { RecordPaymentInput } from "../types/payment.schemas";

export const paymentRepository = {
  async getAllSummaries(collegeId?: string): Promise<MemberPaymentSummary[]> {
    let query = supabase.from("member_payment_summary").select("*");

    if (collegeId) {
      query = query.eq("college_id", collegeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(mapPaymentSummaryFromDb);
  },

  async getByMember(memberId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payment_records")
      .select("*")
      .eq("member_id", memberId)
      .order("payment_date", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapPaymentFromDb);
  },

  async record(input: RecordPaymentInput): Promise<Payment> {
    const { data, error } = await supabase
      .from("payment_records")
      .insert({
        member_id: input.memberId,
        payment_type: input.paymentType,
        amount_paid: input.amountPaid,
        payment_date: input.paymentDate.toISOString(),
        month_ref: input.monthRef,
        year_ref: input.yearRef,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPaymentFromDb(data);
  },
};
