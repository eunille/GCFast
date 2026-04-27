import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse } from "@/lib/utils/api-response";
import { toRange, buildMeta } from "@/lib/utils/pagination";
import { applySearch, applySorting } from "@/lib/utils/query-builder";
import { createSupabaseServer } from "@/lib/supabase/server";
import { apiPaymentSummaryFilterSchema } from "@/features/payments/types/payment.schemas";

const ALLOWED_SORT_FIELDS = [
  "full_name",
  "outstanding_balance",
  "college_name",
  "periods_paid",
] as const;

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate + authorize (treasurer only)
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;

  // 2. Validate query params
  const { searchParams } = new URL(req.url);
  const parsed = validate(
    apiPaymentSummaryFilterSchema,
    Object.fromEntries(searchParams)
  );
  if (!parsed.success) return parsed.response;

  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    collegeId,
    memberType,
    status,
    hasMembershipFee,
    month,
    year,
  } = parsed.data;

  const { from, to } = toRange({ page, pageSize });
  const supabase = await createSupabaseServer();

  // 3. Build query against the materialized view — DB does the filtering
  let query = supabase
    .from("member_payment_summary")
    .select("*", { count: "exact" })
    .range(from, to);

  if (collegeId) query = query.eq("college_id", collegeId);
  if (memberType) query = query.eq("member_type", memberType);
  if (status) query = query.eq("status", status);
  if (hasMembershipFee !== undefined)
    query = query.eq("membership_fee_paid", hasMembershipFee);
  if (month !== undefined)
    query = query.contains("months_paid", [month]);
  if (year !== undefined)
    query = query.eq("year_ref", year);
  if (search) query = applySearch(query, search, ["full_name"]);

  query = applySorting(query, sortBy ?? "full_name", sortOrder, [
    ...ALLOWED_SORT_FIELDS,
  ]);

  // 4. Execute + return paginated result
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return successResponse(
    data ?? [],
    buildMeta(count ?? 0, { page, pageSize })
  );
});
