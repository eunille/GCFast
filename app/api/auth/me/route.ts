import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

interface ProfileRow {
  id: string;
  role: string;
  member_id: string | null;
  members: {
    full_name: string;
    email: string;
  } | null;
}

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Fetch profile with joined member name/email
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, member_id, members(full_name, email)")
    .eq("id", authResult.id)
    .single<ProfileRow>();

  if (error || !data) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Profile not found", 404);
  }

  // 3. Map DB snake_case → TS camelCase — never return raw Supabase User
  return successResponse({
    id: data.id,
    email: data.members?.email ?? authResult.email ?? "",
    fullName: data.members?.full_name ?? "",
    role: data.role,
    memberId: data.member_id ?? null,
  });
});
