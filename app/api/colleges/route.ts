import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate — both roles need this for dropdown data
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Fetch all colleges sorted by name
  const supabase = await createSupabaseServer(req);
  const { data, error } = await supabase
    .from("colleges")
    .select("id, name, code")
    .order("name", { ascending: true });

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, "Failed to fetch colleges", 500);
  }

  return successResponse(data ?? []);
});
