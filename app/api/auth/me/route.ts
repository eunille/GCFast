import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";

interface ProfileRow {
  id: string;
  role: string;
  full_name: string;
  email: string;
}

interface MemberRow {
  id: string;
}

export const GET = apiHandler(async (req: Request) => {
  // 1. Authenticate
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Fetch profile — profiles table has no member_id column; FK is members.profile_id
  const supabase = await createSupabaseServer(req);
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", authResult.id)
    .single<ProfileRow>();

  if (error || !profile) {
    return errorResponse(ErrorCodes.NOT_FOUND, "Profile not found", 404);
  }

  // 3. Resolve linked member id via reverse FK (members.profile_id → profiles.id)
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("profile_id", authResult.id)
    .eq("is_active", true)
    .single<MemberRow>();

  // 4. Map DB snake_case → TS camelCase — never return raw Supabase User
  return successResponse({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    memberId: member?.id ?? null,
  });
});
