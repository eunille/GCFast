import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

interface AcademicPeriodRow {
  id: string;
  label: string;
  year_start: number;
  year_end: number;
  is_active: boolean;
}

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate — both roles need this for dropdown data
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Fetch all academic periods, most recent first
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("academic_periods")
    .select("id, label, year_start, year_end, is_active")
    .order("year_start", { ascending: false });

  if (error) {
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to fetch academic periods",
      500
    );
  }

  // 3. Map DB snake_case → TS camelCase
  const periods = (data ?? []).map((row: AcademicPeriodRow) => ({
    id: row.id,
    label: row.label,
    yearStart: row.year_start,
    yearEnd: row.year_end,
    isActive: row.is_active,
  }));

  return successResponse(periods);
});
