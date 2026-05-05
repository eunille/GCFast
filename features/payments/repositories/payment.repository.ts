// features/payments/repositories/payment.repository.ts
// Layer 2 — DATA: Calls /api/payments via authFetch. No JSX. No React hooks.

import { authFetch } from "@/lib/utils/auth-fetch";
import type {
  PaymentRecord,
  PaymentTransaction,
  PaymentSummaryRow,
  RecordPaymentInput,
  PaymentSummaryQuery,
  PaymentHistoryQuery,
  PaymentRecordQuery,
} from "@/lib/models";
import type { ApiSuccess, PaginationMeta } from "@/lib/models";

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "API error");
  return json.data as T;
}

export const paymentRepository = {
  /** GET /api/payments — paginated transaction records with member + period join */
  async getTransactions(
    filter: PaymentRecordQuery = {}
  ): Promise<{ data: PaymentTransaction[]; meta: PaginationMeta }> {
    const qs = buildQuery(filter as Record<string, string | number | boolean | undefined>);
    const res = await authFetch(`/api/payments${qs}`);
    const json = (await res.json()) as ApiSuccess<PaymentTransaction[]>;
    if (!json.success) throw new Error((json as { error?: { message?: string } }).error?.message ?? "API error");
    return { data: json.data, meta: json.meta! };
  },

  /** GET /api/payments/summaries — paginated member payment summary rows */
  async getSummaries(
    filter: PaymentSummaryQuery = {}
  ): Promise<{ data: PaymentSummaryRow[]; meta: PaginationMeta }> {
    const qs = buildQuery(filter as Record<string, string | number | boolean | undefined>);
    const res = await authFetch(`/api/payments/summaries${qs}`);
    const json = (await res.json()) as ApiSuccess<PaymentSummaryRow[]>;
    if (!json.success) throw new Error((json as { error?: { message?: string } }).error?.message ?? "API error");
    return { data: json.data, meta: json.meta! };
  },

  /** GET /api/payments/member/:memberId — payment history for one member */
  async getByMember(
    memberId: string,
    filter: PaymentHistoryQuery = {}
  ): Promise<{ data: PaymentRecord[]; meta: PaginationMeta }> {
    const qs = buildQuery(filter as Record<string, string | number | boolean | undefined>);
    const res = await authFetch(`/api/payments/member/${memberId}${qs}`);
    const json = (await res.json()) as ApiSuccess<PaymentRecord[]>;
    if (!json.success) throw new Error((json as { error?: { message?: string } }).error?.message ?? "API error");
    return { data: json.data, meta: json.meta! };
  },

  /** GET /api/payments/summaries — all member payment summaries (no pagination wrapper) */
  async getAllSummaries(collegeId?: string): Promise<PaymentSummaryRow[]> {
    const qs = buildQuery({ collegeId, pageSize: 1000 } as Record<string, string | number | boolean | undefined>);
    const res = await authFetch(`/api/payments/summaries${qs}`);
    const json = (await res.json()) as ApiSuccess<PaymentSummaryRow[]>;
    if (!json.success) throw new Error((json as { error?: { message?: string } }).error?.message ?? "API error");
    return json.data;
  },

  /** POST /api/payments — record a new payment */
  async record(input: RecordPaymentInput): Promise<PaymentRecord> {
    const res = await authFetch("/api/payments", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return parseJson<PaymentRecord>(res);
  },
};

