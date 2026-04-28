// app/api/dues-configurations/current/route.ts
// GET — returns the 3 currently active rates in a flat, easy-to-consume format.
// Used by the payment recording form to show "current rate" to the treasurer.

import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse } from "@/lib/utils/api-response";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { DuesConfigRow } from "@/features/dues-configurations/types/dues-config.types";

export const GET = apiHandler(async (req: Request) => {
  // Any authenticated user may view current rates
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const supabase = await createSupabaseServer(req);

  const { data, error } = await supabase
    .from("dues_configurations")
    .select("id, payment_type, member_type, amount, effective_from")
    .is("effective_until", null)
    .order("payment_type", { ascending: true })
    .order("member_type", { ascending: true });

  if (error) throw new Error(error.message);

  // Return as flat key → amount map for quick lookup in the frontend
  const rows = (data ?? []) as unknown as Pick<
    DuesConfigRow,
    "id" | "payment_type" | "member_type" | "amount" | "effective_from"
  >[];

  const current = rows.reduce<
    Record<string, { id: string; amount: number; effectiveFrom: string }>
  >((acc, row) => {
    const key = `${row.payment_type}_${row.member_type}`;
    acc[key] = {
      id: row.id,
      amount: parseFloat(row.amount),
      effectiveFrom: row.effective_from,
    };
    return acc;
  }, {});

  return successResponse(current);
});
