import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { toRange, buildMeta } from "@/lib/utils/pagination";
import { applySearch, applySorting } from "@/lib/utils/query-builder";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  apiMemberFilterSchema,
  apiCreateMemberSchema,
} from "@/features/members/types/member.schemas";
import { mapApiMemberFromDb } from "@/features/members/repositories/member.mapper";

const ALLOWED_SORT_FIELDS = ["full_name", "joined_at", "college_name"] as const;
const MEMBER_SELECT = "*, colleges(name, code), profiles!members_profile_id_fkey(account_status)";

// ─── GET /api/members ─────────────────────────────────────────────────────────

export const GET = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // Treasurer-only: member list contains full details (email, employee ID, notes)
  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  const { searchParams } = new URL(req.url);
  const parsed = validate(apiMemberFilterSchema, Object.fromEntries(searchParams));
  if (!parsed.success) return parsed.response;

  const { page, pageSize, sortBy, sortOrder, search, isActive: _isActive, accountStatus, ...filters } = parsed.data;
  const { from, to } = toRange({ page, pageSize });

  const supabase      = await createSupabaseServer(req);
  const supabaseAdmin = getSupabaseAdmin();

  // Resolve pending profile IDs via admin (bypasses RLS on profiles table).
  // Used for both the pending filter and the pending-first ordering.
  const { data: pendingProfileRows } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("account_status", "pending");
  const pendingIds = (pendingProfileRows ?? []).map((r) => r.id as string);

  // Helper: apply collegeId / memberType / search filters to any query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyFilters(q: any) {
    if (filters.collegeId)  q = q.eq("college_id",  filters.collegeId);
    if (filters.memberType) q = q.eq("member_type", filters.memberType);
    if (search) q = applySearch(q, search, ["full_name", "email"]);
    return q;
  }

  const sortField = sortBy ?? "full_name";

  // ── PENDING-ONLY filter ───────────────────────────────────────────────────
  if (accountStatus === "pending") {
    if (pendingIds.length === 0) {
      return successResponse([], buildMeta(0, { page, pageSize }));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("members")
      .select(MEMBER_SELECT, { count: "exact" })
      .range(from, to)
      .eq("is_active", true)
      .in("profile_id", pendingIds);
    q = applyFilters(q);
    q = applySorting(q, sortField, sortOrder, [...ALLOWED_SORT_FIELDS]);
    const { data, count, error } = await q;
    if (error) throw new Error(error.message);
    return successResponse(
      (data ?? []).map(mapApiMemberFromDb),
      buildMeta(count ?? 0, { page, pageSize })
    );
  }

  // ── INACTIVE filter ───────────────────────────────────────────────────────
  if (accountStatus === "inactive") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("members")
      .select(MEMBER_SELECT, { count: "exact" })
      .range(from, to)
      .eq("is_active", false);
    q = applyFilters(q);
    q = applySorting(q, sortField, sortOrder, [...ALLOWED_SORT_FIELDS]);
    const { data, count, error } = await q;
    if (error) throw new Error(error.message);
    return successResponse(
      (data ?? []).map(mapApiMemberFromDb),
      buildMeta(count ?? 0, { page, pageSize })
    );
  }

  // ── DEFAULT (ACTIVE) VIEW — pending members always appear first ───────────
  //
  // Strategy: two queries merged, so pending members occupy the first N slots
  // across ALL pages regardless of alphabetical order.
  //
  //  Page 1 = [pending[0..min(pageSize,pendingTotal)-1]] + [active[0..remaining-1]]
  //  Page 2 = [active[remaining..remaining+pageSize-1]]   (pending slots exhausted)

  // Step 1 — fetch ALL filtered pending members (no range — typically few)
  let pendingMembers: ReturnType<typeof mapApiMemberFromDb>[] = [];
  if (pendingIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pq: any = supabase
      .from("members")
      .select(MEMBER_SELECT)
      .eq("is_active", true)
      .in("profile_id", pendingIds);
    pq = applyFilters(pq);
    pq = applySorting(pq, sortField, sortOrder, [...ALLOWED_SORT_FIELDS]);
    const { data: pd } = await pq;
    pendingMembers = (pd ?? []).map(mapApiMemberFromDb);
  }

  const pendingTotal = pendingMembers.length;
  // Slice of pending members that belong on the current page
  const pendingSlice = pendingMembers.slice(from, to + 1);

  // Step 2 — fetch active (non-pending) members with adjusted offset
  const activeFrom = Math.max(0, from - pendingTotal);
  const activeTo   = to - pendingTotal;   // negative means this page is all-pending

  let activeMembers: ReturnType<typeof mapApiMemberFromDb>[] = [];
  let activeTotal = 0;

  if (activeTo >= 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aq: any = supabase
      .from("members")
      .select(MEMBER_SELECT, { count: "exact" })
      .range(activeFrom, activeTo)
      .eq("is_active", true);
    if (pendingIds.length > 0) {
      // Must use .or() so that NULL profile_id rows are NOT excluded.
      // SQL "NOT IN" with NULLs: NULL NOT IN (...) = NULL (falsy) → rows dropped.
      aq = aq.or(`profile_id.is.null,profile_id.not.in.(${pendingIds.join(",")})`);
    }
    aq = applyFilters(aq);
    aq = applySorting(aq, sortField, sortOrder, [...ALLOWED_SORT_FIELDS]);
    const { data: ad, count, error } = await aq;
    if (error) throw new Error(error.message);
    activeMembers = (ad ?? []).map(mapApiMemberFromDb);
    activeTotal   = count ?? 0;
  } else {
    // Page is entirely filled by pending members; still need active total for pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cq: any = supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    if (pendingIds.length > 0) {
      cq = cq.or(`profile_id.is.null,profile_id.not.in.(${pendingIds.join(",")})`);
    }
    cq = applyFilters(cq);
    const { count } = await cq;
    activeTotal = count ?? 0;
  }

  return successResponse(
    [...pendingSlice, ...activeMembers],
    buildMeta(pendingTotal + activeTotal, { page, pageSize })
  );
});


// ─── POST /api/members ────────────────────────────────────────────────────────

export const POST = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(apiCreateMemberSchema, body);
  if (!parsed.success) return parsed.response;

  const supabase = await createSupabaseServer(req);
  const supabaseAdmin = getSupabaseAdmin();
  const { fullName, email, password, collegeId, memberType, employeeId, joinedAt, notes } = parsed.data;

  // Email uniqueness check
  const { count: emailCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("email", email);

  if (emailCount && emailCount > 0) {
    return errorResponse(ErrorCodes.CONFLICT, "A member with this email already exists", 409);
  }

  // College existence check
  const { count: collegeCount } = await supabase
    .from("colleges")
    .select("id", { count: "exact", head: true })
    .eq("id", collegeId);

  if (!collegeCount || collegeCount === 0) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "College not found", 400);
  }

  // ── Auth account creation (when password is provided) ─────────────────────
  // If a password was supplied, create a Supabase auth user first so the member
  // can log in immediately. We use email_confirm: true to bypass the confirmation
  // email. If auth creation fails we abort before touching the members table.
  let profileId: string | null = null;

  if (password) {
    // Guard against duplicate auth accounts
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (alreadyExists) {
      return errorResponse(
        ErrorCodes.ALREADY_EXISTS,
        "An auth account with this email already exists. Remove the password or use a different email.",
        409
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "member" },
    });

    if (authError) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, authError.message, 500);
    }

    profileId = authData.user.id;
  } else {
    // No password: check if a profile already exists (member registered independently)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    profileId = existingProfile?.id ?? null;
  }

  // ── Insert member record ───────────────────────────────────────────────────
  const { data, error } = await supabase
    .from("members")
    .insert({
      full_name: fullName,
      email,
      college_id: collegeId,
      member_type: memberType,
      employee_id: employeeId,
      joined_at: joinedAt,
      notes,
      is_active: true,
      profile_id: profileId,
      created_by: authResult.id,
    })
    .select(MEMBER_SELECT)
    .single();

  if (error) {
    // Rollback: delete the auth user we just created to avoid orphaned accounts
    if (profileId && password) {
      await supabaseAdmin.auth.admin.deleteUser(profileId);
    }
    throw new Error(error.message);
  }

  return successResponse(mapApiMemberFromDb(data as Record<string, unknown>), undefined, 201);
});
