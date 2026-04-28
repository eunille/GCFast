import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate — both roles need this for dropdown data
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Fetch all academic periods, most recent first
  const supabase = await createSupabaseServer(req);
  const { data, error } = await supabase
    .from("academic_periods")
    .select("id, label, month, year, is_active")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) {
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to fetch academic periods",
      500
    );
  }

  const periods = (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    month: row.month,
    year: row.year,
    isActive: row.is_active,
  }));

  return successResponse(periods);
});
