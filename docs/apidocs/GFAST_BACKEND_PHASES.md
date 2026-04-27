# GFAST-MPTS — Backend Development Phases

**Next.js API Routes + Supabase | Industry Standard Checklist**

---

## Table of Contents

1. [Standards Applied](#1-standards-applied)
2. [Filtering Standards](#2-filtering-standards)
3. [Phase 0 — Foundation & Project Setup](#3-phase-0--foundation--project-setup)
4. [Phase 1 — Authentication & Authorization](#4-phase-1--authentication--authorization)
5. [Phase 2 — Member Management API](#5-phase-2--member-management-api)
6. [Phase 3 — Payment Recording API](#6-phase-3--payment-recording-api)
7. [Phase 4 — Dashboard & Aggregation API](#7-phase-4--dashboard--aggregation-api)
8. [Phase 5 — Reports & Export API](#8-phase-5--reports--export-api)
9. [Phase 6 — Hardening, QA & Deployment](#9-phase-6--hardening-qa--deployment)

---

## 1. Standards Applied

These are applied across **every phase** — not just at the end.

### Identifiers
- All primary keys are **UUID v4** (`gen_random_uuid()` in Postgres) — never auto-increment integers
- UUIDs prevent enumeration attacks (`/api/members/1`, `/api/members/2` is guessable — `/api/members/uuid` is not)
- Expose only UUIDs in API responses — never internal DB sequences

### Validation
- Every incoming request body is validated with **Zod** before touching the database
- Validated at the API route level — services receive already-clean data
- Return `400 Bad Request` with a structured error if validation fails — never let bad data reach the DB

### Security
- All routes are protected by `withAuth` middleware — no unguarded endpoints
- Role checked via `withRole()` — treasurer-only routes reject members with `403`
- Supabase **Row Level Security (RLS)** is the last line of defense — enforced at DB level even if middleware is bypassed
- No sensitive fields in responses (no passwords, no internal IDs, no `service_role` key ever in frontend)
- `CORS` configured to allow only your Vercel domain in production
- Rate limiting on auth endpoints to prevent brute force
- Environment variables in `.env.local` only — never committed to git

### Pagination
- All list endpoints support cursor-based or offset pagination
- Default page size: **20 rows** — never return unbounded results
- Response shape always includes `data`, `count`, `page`, `pageSize`, `hasMore`

### Error Handling
- Consistent error response shape across every route
- Never expose raw Postgres errors or stack traces to the client
- All errors are caught — no unhandled promise rejections

### Response Shape
Every API response follows one consistent envelope:

```typescript
// Success
{
  "success": true,
  "data": { ... },         // single object or array
  "meta": {                // only on list endpoints
    "count": 42,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",    // machine-readable
    "message": "Amount must be greater than 0",  // human-readable
    "details": [ ... ]             // optional field-level errors
  }
}
```

### Timestamps
- All tables have `created_at` and `updated_at` (auto-managed by trigger)
- All dates returned as **ISO 8601** strings — `2025-01-15T08:00:00.000Z`
- Never return raw Postgres timestamp format

### Soft Deletes
- Members are never hard deleted — `is_active = false`
- Payment records are never deleted — append-only ledger
- All list queries filter `WHERE is_active = TRUE` by default

### Naming Conventions
- Database: `snake_case` for all tables, columns, functions
- API routes: `kebab-case` URL paths — `/api/academic-periods`
- TypeScript: `camelCase` for variables and functions, `PascalCase` for types
- Mappers convert DB `snake_case` → TS `camelCase` at the repository layer

---

## 2. Filtering Standards

All filtering is **backend-driven** — the frontend sends query params, the database does the work. Never fetch all rows and filter in JavaScript.

### Core Rule

```
Frontend sends:  GET /api/payments/summaries?collegeId=uuid&status=HAS_BALANCE&memberType=FULL_TIME
Backend builds:  Supabase query with .eq(), .ilike(), .in() chained conditionally
DB executes:     Filtered, paginated SQL — only matching rows returned
```

### Reusable Filter Builder

All list endpoints use a shared pattern — build the query conditionally, never string-concatenate SQL:

```typescript
// lib/utils/query-builder.ts

export function applyMemberFilters(query: any, filters: MemberFilterParams) {
  if (filters.collegeId)   query = query.eq("college_id", filters.collegeId);
  if (filters.memberType)  query = query.eq("member_type", filters.memberType);
  if (filters.isActive !== undefined)
                           query = query.eq("is_active", filters.isActive);
  if (filters.search)      query = query.or(
    `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
  );
  return query;
}

export function applyPaymentSummaryFilters(query: any, filters: PaymentSummaryFilterParams) {
  if (filters.collegeId)            query = query.eq("college_id", filters.collegeId);
  if (filters.memberType)           query = query.eq("member_type", filters.memberType);
  if (filters.status)               query = query.eq("status", filters.status);
  if (filters.hasMembershipFee !== undefined)
                                    query = query.eq("membership_fee_paid", filters.hasMembershipFee);
  if (filters.month)                query = query.contains("months_paid", [filters.month]);
  if (filters.year)                 query = query.eq("year_ref", filters.year);
  if (filters.search)               query = query.ilike("full_name", `%${filters.search}%`);
  return query;
}

export function applySorting(
  query: any,
  sortBy: string,
  sortOrder: "asc" | "desc",
  allowedFields: string[]   // whitelist — never sort by arbitrary column
) {
  if (!allowedFields.includes(sortBy)) return query;
  return query.order(sortBy, { ascending: sortOrder === "asc" });
}
```

### All Supported Filters

#### `GET /api/members`

| Param | Type | Description |
|---|---|---|
| `collegeId` | UUID | Filter by department/college |
| `memberType` | `FULL_TIME` \| `ASSOCIATE` | Filter by membership type |
| `isActive` | `true` \| `false` | Default `true`. Pass `false` for deactivated member audit |
| `search` | string | Case-insensitive match on `full_name` and `email` |
| `sortBy` | `full_name` \| `joined_at` \| `college_name` | Column to sort by |
| `sortOrder` | `asc` \| `desc` | Default `asc` |
| `page` | number | Default `1` |
| `pageSize` | number | Default `20`, max `100` |

#### `GET /api/payments/summaries`

| Param | Type | Description |
|---|---|---|
| `collegeId` | UUID | Filter by college — the main Treasurer filter |
| `memberType` | `FULL_TIME` \| `ASSOCIATE` | Filter by membership type |
| `status` | `COMPLETE` \| `HAS_BALANCE` | Filter by overall payment status |
| `hasMembershipFee` | `true` \| `false` | Who has or hasn't paid the one-time membership fee |
| `month` | `1`–`12` | Members who have (or haven't) paid a specific month |
| `year` | number | Filter dues by academic year |
| `search` | string | Search by member name |
| `sortBy` | `full_name` \| `outstanding_balance` \| `college_name` \| `periods_paid` | Column to sort by |
| `sortOrder` | `asc` \| `desc` | Default `asc` |
| `page` | number | Default `1` |
| `pageSize` | number | Default `20`, max `100` |

#### `GET /api/payments/member/[memberId]`

| Param | Type | Description |
|---|---|---|
| `paymentType` | `MEMBERSHIP_FEE` \| `MONTHLY_DUES` | Filter by payment type |
| `year` | number | Filter to a specific dues year |
| `sortBy` | `payment_date` \| `amount_paid` | Column to sort by |
| `sortOrder` | `asc` \| `desc` | Default `desc` (latest first) |
| `page` | number | Default `1` |
| `pageSize` | number | Default `20`, max `100` |

#### `POST /api/reports/generate`

| Field | Type | Description |
|---|---|---|
| `collegeId` | UUID (optional) | Scope report to one college. Omit for all |
| `memberType` | `FULL_TIME` \| `ASSOCIATE` (optional) | Scope by membership type |
| `status` | `COMPLETE` \| `HAS_BALANCE` (optional) | Only members matching this status |
| `year` | number | Required — the academic year for the report |
| `format` | `json` \| `excel` \| `pdf` | Output format |

### Zod Filter Schemas

```typescript
// lib/utils/filter-schemas.ts
import { z } from "zod";

export const paginationSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const sortSchema = (allowedFields: [string, ...string[]]) => z.object({
  sortBy:    z.enum(allowedFields).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const memberFilterSchema = z.object({
  collegeId:  z.string().uuid().optional(),
  memberType: z.enum(["FULL_TIME", "ASSOCIATE"]).optional(),
  isActive:   z.coerce.boolean().optional(),
  search:     z.string().max(100).trim().optional(),
}).merge(paginationSchema)
  .merge(sortSchema(["full_name", "joined_at", "college_name"]));

export const paymentSummaryFilterSchema = z.object({
  collegeId:        z.string().uuid().optional(),
  memberType:       z.enum(["FULL_TIME", "ASSOCIATE"]).optional(),
  status:           z.enum(["COMPLETE", "HAS_BALANCE"]).optional(),
  hasMembershipFee: z.coerce.boolean().optional(),
  month:            z.coerce.number().int().min(1).max(12).optional(),
  year:             z.coerce.number().int().min(2020).optional(),
  search:           z.string().max(100).trim().optional(),
}).merge(paginationSchema)
  .merge(sortSchema(["full_name", "outstanding_balance", "college_name", "periods_paid"]));

export const paymentHistoryFilterSchema = z.object({
  paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]).optional(),
  year:        z.coerce.number().int().min(2020).optional(),
}).merge(paginationSchema)
  .merge(sortSchema(["payment_date", "amount_paid"]));

export type MemberFilterParams         = z.infer<typeof memberFilterSchema>;
export type PaymentSummaryFilterParams = z.infer<typeof paymentSummaryFilterSchema>;
export type PaymentHistoryFilterParams = z.infer<typeof paymentHistoryFilterSchema>;
```

### How It Looks in an API Route

```typescript
// app/api/payments/summaries/route.ts

export const GET = apiHandler(async (req: Request) => {
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole("treasurer");
  if (roleResult.error) return errorResponse(roleResult.error.code, roleResult.error.message, 403);

  // 1. Parse + validate all query params
  const { searchParams } = new URL(req.url);
  const parsed = validate(paymentSummaryFilterSchema, Object.fromEntries(searchParams));
  if (!parsed.success) return parsed.response;

  const { page, pageSize, sortBy, sortOrder, ...filters } = parsed.data;
  const { from, to } = toRange({ page, pageSize });

  const supabase = createSupabaseServer();

  // 2. Build query — DB does the filtering, not JS
  let query = supabase
    .from("member_payment_summary")
    .select("*", { count: "exact" })
    .range(from, to);

  // 3. Apply filters conditionally
  query = applyPaymentSummaryFilters(query, filters);

  // 4. Apply sort (whitelisted)
  query = applySorting(
    query,
    sortBy ?? "full_name",
    sortOrder,
    ["full_name", "outstanding_balance", "college_name", "periods_paid"]
  );

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  // 5. Return paginated envelope
  return successResponse(data, buildMeta(count ?? 0, { page, pageSize }));
});
```

### Filter Checklist

- [ ] All filter params go through Zod before touching the DB — invalid UUIDs return `400`
- [ ] `search` is trimmed and length-capped — prevents slow `ILIKE` on huge strings
- [ ] `sortBy` is always whitelisted — arbitrary column names rejected (SQL injection prevention)
- [ ] `pageSize` is capped at `100` — no unbounded queries ever reach the DB
- [ ] Boolean coercion handles URL string `"true"` / `"false"` → real booleans via `z.coerce.boolean()`
- [ ] All filter combinations tested: single filter, multiple combined, no filters (returns paginated all)
- [ ] Empty result returns `{ data: [], meta: { count: 0, hasMore: false } }` — not a `404`
- [ ] Filters on `member_payment_summary` view confirmed to work in Supabase SQL Editor before wiring to routes

---

## 3. Phase 0 — Foundation & Project Setup

**Goal:** The project skeleton is production-ready before any feature is built.

### Project Init

- [ ] Initialize Next.js with TypeScript strict mode (`"strict": true` in tsconfig)
- [ ] Enable `"noUncheckedIndexedAccess": true` in tsconfig — catches undefined array access
- [ ] Set up ESLint with `@typescript-eslint` rules — no `any` allowed
- [ ] Set up Prettier for consistent formatting
- [ ] Initialize Git with a `.gitignore` that covers `.env*`, `node_modules`, `.next`

### Environment Variables

- [ ] Create `.env.local` for secrets (never committed)
- [ ] Create `.env.example` with placeholder values (committed — documents what's needed)

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-side only, never exposed to browser
```

- [ ] Rule: `NEXT_PUBLIC_` prefix only for values safe to expose to the browser
- [ ] Rule: `SUPABASE_SERVICE_ROLE_KEY` used only in server-side API routes — never in client code

### Supabase Setup

- [ ] Create Supabase project
- [ ] Run `supabase/migrations/001_gfast_schema.sql` in SQL Editor
- [ ] Verify all tables created, enums active, triggers working
- [ ] Verify `handle_new_user` trigger fires on new auth user creation
- [ ] Seed colleges, academic periods, dues configurations
- [ ] Enable email auth in Supabase Auth settings
- [ ] Disable public signups — only treasurer can invite members

### Supabase Clients

```typescript
// lib/supabase/client.ts — browser (uses anon key, respects RLS)
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

```typescript
// lib/supabase/server.ts — server-side only (API routes, Server Components)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );
}
```

```typescript
// lib/supabase/admin.ts — service role, bypasses RLS — use SPARINGLY
// Only for trusted server operations like inviting a member
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Middleware Setup

```typescript
// lib/middleware/withAuth.ts
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function withAuth(req: Request) {
  const supabase = createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }
  return user;
}
```

```typescript
// lib/middleware/withRole.ts
import { createSupabaseServer } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/shared.types";

export async function withRole(requiredRole: UserRole) {
  const supabase = createSupabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single();

  if (profile?.role !== requiredRole) {
    return { error: { code: "FORBIDDEN", message: "Insufficient permissions" }, status: 403 };
  }
  return { profile };
}
```

### API Response Helpers

```typescript
// lib/utils/api-response.ts

export function successResponse(data: unknown, meta?: object, status = 200) {
  return Response.json({ success: true, data, ...(meta && { meta }) }, { status });
}

export function errorResponse(code: string, message: string, status: number, details?: unknown) {
  return Response.json(
    { success: false, error: { code, message, ...(details && { details }) } },
    { status }
  );
}
```

### Global Error Handler

```typescript
// lib/utils/api-handler.ts
// Wraps every route handler — catches unhandled errors

export function apiHandler(
  handler: (req: Request, ctx?: unknown) => Promise<Response>
) {
  return async (req: Request, ctx?: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error("[API Error]", err);
      return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
    }
  };
}
```

### Validation Setup

- [ ] Install Zod: `npm install zod`
- [ ] All schemas live in `features/*/types/*.schemas.ts`
- [ ] Create reusable validation helper:

```typescript
// lib/utils/validate.ts
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "./api-response";

export function validate<T>(schema: ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; response: Response } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      response: errorResponse(
        "VALIDATION_ERROR",
        "Invalid request data",
        400,
        result.error.flatten().fieldErrors
      ),
    };
  }
  return { success: true, data: result.data };
}
```

### Pagination Helper

```typescript
// lib/utils/pagination.ts

export interface PaginationParams {
  page: number;   // 1-based
  pageSize: number;
}

export interface PaginationMeta {
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  return { page, pageSize };
}

export function buildMeta(count: number, { page, pageSize }: PaginationParams): PaginationMeta {
  return { count, page, pageSize, hasMore: page * pageSize < count };
}

// Converts page/pageSize to Supabase range
export function toRange({ page, pageSize }: PaginationParams) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}
```

---

## 4. Phase 1 — Authentication & Authorization

**Goal:** Secure login, session management, and role enforcement working end to end.

### Supabase Auth Config

- [ ] Disable public signups in Supabase Auth settings (invite only)
- [ ] Set JWT expiry to 1 hour, refresh token expiry to 7 days
- [ ] Configure email templates for invite and password reset

### API Routes

#### `GET /api/auth/me`
Returns the authenticated user's profile and role.

- [ ] Call `supabase.auth.getUser()` — return `401` if no session
- [ ] Fetch `profiles` row for the user
- [ ] Return `{ id, email, fullName, role }`
- [ ] Never return the raw Supabase user object — map to clean shape

#### `POST /api/auth/invite` *(Treasurer only)*
Invites a faculty member to create their login.

- [ ] Guard with `withRole('treasurer')`
- [ ] Validate body: `{ email, fullName, memberId }`
- [ ] Use `supabaseAdmin.auth.admin.inviteUserByEmail()` — sends invite email
- [ ] Link the new `profiles` row to the `members` row via `profile_id`
- [ ] Return `201` on success

#### `POST /api/auth/signout`
Signs out the current user.

- [ ] Call `supabase.auth.signOut()`
- [ ] Return `200` — frontend handles redirect

### Security Checklist — Phase 1

- [ ] Confirm `withAuth` returns `401` when called without a valid JWT
- [ ] Confirm `withRole('treasurer')` returns `403` when called by a member
- [ ] Confirm RLS blocks member from reading another member's profile row in SQL Editor
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is only used in `lib/supabase/admin.ts` — grep the codebase
- [ ] Confirm no auth tokens appear in API response bodies

---

## 5. Phase 2 — Member Management API

**Goal:** Full CRUD for faculty members with filtering, pagination, and soft delete.

### Zod Schemas

```typescript
// features/members/types/member.schemas.ts
import { z } from "zod";

export const createMemberSchema = z.object({
  fullName:    z.string().min(2).max(100),
  email:       z.string().email(),
  collegeId:   z.string().uuid(),
  memberType:  z.enum(["FULL_TIME", "ASSOCIATE"]),
  employeeId:  z.string().max(50).optional(),
  joinedAt:    z.string().date().optional(),   // ISO date string YYYY-MM-DD
  notes:       z.string().max(500).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberFilterSchema = z.object({
  collegeId: z.string().uuid().optional(),
  isActive:  z.enum(["true", "false"]).optional(),
  search:    z.string().max(100).optional(),   // search by name or email
  page:      z.string().optional(),
  pageSize:  z.string().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
```

### API Routes

#### `GET /api/members`

- [ ] Guard: `withAuth` (treasurer sees all, member endpoint is separate)
- [ ] Parse + validate query params with `memberFilterSchema`
- [ ] Apply `collegeId` filter if provided
- [ ] Apply `search` filter: `ilike` on `full_name` or `email`
- [ ] Filter `is_active = TRUE` by default (unless `?isActive=false` for treasurer audit)
- [ ] Apply pagination via `toRange()`
- [ ] Return `{ data: Member[], meta: PaginationMeta }`
- [ ] Order by `full_name ASC`

#### `GET /api/members/[id]`

- [ ] Guard: `withAuth`
- [ ] Validate `id` is a valid UUID — return `400` if not
- [ ] Treasurer: can fetch any member
- [ ] Member: can only fetch own record (check `profile_id = auth.uid()`)
- [ ] Return `404` if member not found or `is_active = FALSE`

#### `POST /api/members`

- [ ] Guard: `withRole('treasurer')`
- [ ] Validate body with `createMemberSchema`
- [ ] Check `email` uniqueness — return `409 Conflict` if already exists
- [ ] Check `collegeId` exists in `colleges` table — return `400` if not
- [ ] Insert member, set `created_by = auth.uid()`
- [ ] Return `201` with created member

#### `PATCH /api/members/[id]`

- [ ] Guard: `withRole('treasurer')`
- [ ] Validate `id` is UUID
- [ ] Validate body with `updateMemberSchema`
- [ ] If `email` is changing, check uniqueness against other members
- [ ] Return `404` if member not found
- [ ] Return `200` with updated member

#### `PATCH /api/members/[id]/deactivate`

- [ ] Guard: `withRole('treasurer')`
- [ ] Set `is_active = FALSE` — never hard delete
- [ ] Return `200` with `{ message: "Member deactivated" }`
- [ ] If member has payment records, confirm soft delete proceeds (records stay)

### Mapper

```typescript
// features/members/repositories/member.mapper.ts

export function mapMemberFromDb(row: any): Member {
  return {
    id:          row.id,
    profileId:   row.profile_id,
    collegeId:   row.college_id,
    collegeName: row.colleges?.name,
    collegeCode: row.colleges?.code,
    employeeId:  row.employee_id,
    fullName:    row.full_name,
    email:       row.email,
    memberType:  row.member_type,
    joinedAt:    row.joined_at,
    isActive:    row.is_active,
    notes:       row.notes,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}
```

### Checklist — Phase 2

- [ ] `GET /api/members` with no auth → `401`
- [ ] `POST /api/members` as member role → `403`
- [ ] `POST /api/members` with duplicate email → `409`
- [ ] `POST /api/members` with invalid UUID for `collegeId` → `400`
- [ ] `GET /api/members?page=2&pageSize=5` returns correct slice with `hasMore`
- [ ] `GET /api/members?search=juan` filters by name correctly
- [ ] `PATCH /api/members/[id]/deactivate` → member no longer appears in default list

---

## 6. Phase 3 — Payment Recording API

**Goal:** Treasurer can record payments. Duplicate prevention enforced. Ledger is append-only.

### Zod Schemas

```typescript
// features/payments/types/payment.schemas.ts
import { z } from "zod";

export const recordPaymentSchema = z.object({
  memberId:         z.string().uuid(),
  paymentType:      z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]),
  amountPaid:       z.number().positive("Amount must be greater than 0"),
  paymentDate:      z.string().date(),           // YYYY-MM-DD
  academicPeriodId: z.string().uuid().optional(), // required if MONTHLY_DUES
  referenceNumber:  z.string().max(100).optional(),
  notes:            z.string().max(500).optional(),
}).refine(
  (data) => data.paymentType === "MEMBERSHIP_FEE" || !!data.academicPeriodId,
  { message: "academicPeriodId is required for MONTHLY_DUES", path: ["academicPeriodId"] }
);

export const paymentFilterSchema = z.object({
  memberId:    z.string().uuid().optional(),
  collegeId:   z.string().uuid().optional(),
  paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]).optional(),
  page:        z.string().optional(),
  pageSize:    z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
```

### API Routes

#### `GET /api/payments/summaries`

- [ ] Guard: `withRole('treasurer')`
- [ ] Queries the `member_payment_summary` view
- [ ] Supports `?collegeId=` filter
- [ ] Supports `?status=COMPLETE|HAS_BALANCE` filter
- [ ] Supports `?search=` filter on member name
- [ ] Apply pagination
- [ ] Return `{ data: MemberPaymentSummary[], meta: PaginationMeta }`

#### `GET /api/payments/member/[memberId]`

- [ ] Guard: `withAuth`
- [ ] Treasurer: can fetch any member's payments
- [ ] Member: can only fetch own (`profile_id = auth.uid()` check against `memberId`)
- [ ] Returns full payment history for that member, ordered by `payment_date DESC`
- [ ] Apply pagination

#### `POST /api/payments`

- [ ] Guard: `withRole('treasurer')`
- [ ] Validate body with `recordPaymentSchema`
- [ ] Verify `memberId` exists and is active — `404` if not
- [ ] If `MEMBERSHIP_FEE`: check no existing membership fee for this member — `409` if duplicate
- [ ] If `MONTHLY_DUES`: verify `academicPeriodId` exists — `400` if not
- [ ] If `MONTHLY_DUES`: check no existing dues payment for same member + period — `409` if duplicate
- [ ] Insert into `payment_records`, set `recorded_by = auth.uid()`
- [ ] Return `201` with created payment record

#### `GET /api/academic-periods`

- [ ] Guard: `withAuth` (both roles need this for dropdowns)
- [ ] Return all active periods ordered by `year DESC, month DESC`
- [ ] No pagination needed — max 12 per year, small dataset

#### `GET /api/colleges`

- [ ] Guard: `withAuth`
- [ ] Return all active colleges ordered by `name ASC`
- [ ] No pagination — small reference dataset, cache-friendly

### Service Layer

```typescript
// lib/services/payment.service.ts

export const paymentService = {

  async assertNoMembershipFeeDuplicate(memberId: string, supabase: SupabaseClient) {
    const { count } = await supabase
      .from("payment_records")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("payment_type", "MEMBERSHIP_FEE");

    if (count && count > 0) {
      throw new ConflictError("Membership fee already recorded for this member");
    }
  },

  async assertNoDuesDuplicate(memberId: string, periodId: string, supabase: SupabaseClient) {
    const { count } = await supabase
      .from("payment_records")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("payment_type", "MONTHLY_DUES")
      .eq("academic_period_id", periodId);

    if (count && count > 0) {
      throw new ConflictError("Monthly dues already recorded for this member and period");
    }
  },

  async assertMemberExists(memberId: string, supabase: SupabaseClient) {
    const { data } = await supabase
      .from("members")
      .select("id, is_active")
      .eq("id", memberId)
      .single();

    if (!data || !data.is_active) {
      throw new NotFoundError("Member not found or inactive");
    }
  },
};
```

### Checklist — Phase 3

- [ ] `POST /api/payments` with `MEMBERSHIP_FEE` twice for same member → `409`
- [ ] `POST /api/payments` with `MONTHLY_DUES` and no `academicPeriodId` → `400` (Zod refine)
- [ ] `POST /api/payments` with `MONTHLY_DUES` twice for same member + period → `409`
- [ ] `POST /api/payments` with `amountPaid: -50` → `400`
- [ ] `GET /api/payments/member/[otherId]` as member role → `403`
- [ ] Verify `member_payment_summary` view recalculates correctly after inserting a payment
- [ ] Verify `outstanding_balance` drops to 0 when all dues are paid

---

## 7. Phase 4 — Dashboard & Aggregation API

**Goal:** Summary stats for the Treasurer overview. Member's own standing endpoint.

### API Routes

#### `GET /api/dashboard/treasurer`

- [ ] Guard: `withRole('treasurer')`
- [ ] Run aggregation queries — do NOT fetch all rows and calculate in JS

```typescript
// Returns:
{
  totalMembers:        number,  // active members
  totalCollected:      number,  // sum of all payments (PHP)
  membersWithBalance:  number,  // count where status = HAS_BALANCE
  membersComplete:     number,  // count where status = COMPLETE
  collectionByCollege: {        // per-college breakdown
    collegeId:   string,
    collegeName: string,
    total:       number,
    memberCount: number,
  }[]
}
```

- [ ] All numbers come from DB-level aggregation (Supabase `count`, `sum`) — not JS `.reduce()`
- [ ] Cache this response for 60 seconds using Next.js route `revalidate`:

```typescript
// app/api/dashboard/treasurer/route.ts
export const revalidate = 60; // re-fetch at most once per minute
```

#### `GET /api/dashboard/member`

- [ ] Guard: `withAuth`
- [ ] Fetch own row from `member_payment_summary` view using `auth.uid()` → `profile_id` → `member.id`
- [ ] Return:

```typescript
{
  memberId:           string,
  fullName:           string,
  college:            string,
  memberType:         string,
  membershipFeePaid:  boolean,
  periodsExpected:    number,
  periodsPaid:        number,
  monthsPaid:         number[],   // e.g. [1, 2, 3]
  outstandingBalance: number,
  status:             "COMPLETE" | "HAS_BALANCE",
  lastPaymentDate:    string | null,
}
```

### Checklist — Phase 4

- [ ] `totalCollected` matches manually summed `payment_records`
- [ ] `membersWithBalance` + `membersComplete` = `totalMembers`
- [ ] Member endpoint returns own data only — cannot pass another member's ID
- [ ] Dashboard returns `0` values gracefully when no data exists (new system, empty DB)

---

## 8. Phase 5 — Reports & Export API

**Goal:** Treasurer can generate and download payment reports as PDF or Excel.

### Zod Schema

```typescript
// features/reports/types/report.schemas.ts
import { z } from "zod";

export const generateReportSchema = z.object({
  collegeId:   z.string().uuid().optional(),   // filter by college, null = all
  year:        z.number().int().min(2020).max(2099),
  format:      z.enum(["json", "excel", "pdf"]),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
```

### API Routes

#### `POST /api/reports/generate`

- [ ] Guard: `withRole('treasurer')`
- [ ] Validate body with `generateReportSchema`
- [ ] Build report data from `member_payment_summary` + filters in `report.service.ts`
- [ ] If `format = "json"`: return structured JSON (used for in-browser preview)
- [ ] If `format = "excel"`: stream `.xlsx` file
- [ ] If `format = "pdf"`: stream `.pdf` file

### Service Layer

```typescript
// lib/services/report.service.ts

export const reportService = {

  async buildReportData(input: GenerateReportInput, supabase: SupabaseClient) {
    let query = supabase
      .from("member_payment_summary")
      .select("*");

    if (input.collegeId) query = query.eq("college_id", input.collegeId);

    const { data, error } = await query.order("college_name").order("full_name");
    if (error) throw new Error(error.message);

    return {
      generatedAt:  new Date().toISOString(),
      year:         input.year,
      college:      input.collegeId ? data[0]?.college_name : "All Colleges",
      totalMembers: data.length,
      totalCollected: data.reduce((sum, m) =>
        sum + m.membership_fee_amount_paid + m.total_dues_paid, 0),
      members: data.map(mapReportRow),
    };
  },
};
```

### Excel Export

- [ ] Install `exceljs`: `npm install exceljs`
- [ ] Build workbook in `report.service.ts` — not in the route handler
- [ ] Set correct response headers:

```typescript
return new Response(excelBuffer, {
  headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="gfast-report-${year}.xlsx"`,
  },
});
```

### PDF Export

- [ ] Install `pdfkit`: `npm install pdfkit`
- [ ] Set correct response headers:

```typescript
return new Response(pdfBuffer, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="gfast-report-${year}.pdf"`,
  },
});
```

### Checklist — Phase 5

- [ ] JSON report totals match the Treasurer dashboard totals
- [ ] Excel file opens cleanly in Excel and Google Sheets
- [ ] PDF file is readable and contains correct data
- [ ] Report with no data (empty college) returns graceful empty state — not an error
- [ ] Member role calling `POST /api/reports/generate` → `403`
- [ ] Filename contains year and college code for easy identification

---

## 9. Phase 6 — Hardening, QA & Deployment

**Goal:** System is secure, observable, and stable in production.

### Security Audit

- [ ] Grep codebase for `SUPABASE_SERVICE_ROLE_KEY` — must only appear in `lib/supabase/admin.ts`
- [ ] Grep codebase for `process.env.NEXT_PUBLIC_` — confirm no secrets use this prefix
- [ ] Confirm every `app/api/**/route.ts` has `withAuth` at minimum
- [ ] Confirm every treasurer-only route has `withRole('treasurer')`
- [ ] Test all RLS policies in Supabase SQL Editor with both roles:

```sql
-- Test as member: should return only own row
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims TO '{"sub": "<member-user-id>"}';
SELECT * FROM members;  -- should return 1 row max

-- Test as treasurer: should return all rows
SET LOCAL request.jwt.claims TO '{"sub": "<treasurer-user-id>"}';
SELECT * FROM members;  -- should return all
```

- [ ] Confirm `payment_records` cannot be deleted by any role:

```sql
DELETE FROM payment_records WHERE id = '<any-id>';  -- should fail
```

### Input Hardening

- [ ] Every route validates `id` params are valid UUIDs before querying:

```typescript
import { z } from "zod";

const uuidSchema = z.string().uuid();
const result = uuidSchema.safeParse(params.id);
if (!result.success) return errorResponse("INVALID_ID", "Invalid ID format", 400);
```

- [ ] All string inputs are trimmed before processing
- [ ] Numeric inputs (amounts) are rounded to 2 decimal places before insert
- [ ] Date inputs validated as valid calendar dates (e.g. month 13 rejected)

### Error Handling Audit

- [ ] Every route is wrapped with `apiHandler()` — no unhandled promise rejections
- [ ] No raw Postgres error messages in API responses (`.message` from Supabase error caught and mapped)
- [ ] No stack traces in production responses
- [ ] All `400`, `401`, `403`, `404`, `409` cases return the standard error envelope

### CORS

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.ALLOWED_ORIGIN ?? "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};
```

- [ ] Set `ALLOWED_ORIGIN` to your Vercel domain in production env vars
- [ ] Never use `*` in production

### Logging

- [ ] Add structured request logging to every API route:

```typescript
console.log(JSON.stringify({
  method: req.method,
  path: new URL(req.url).pathname,
  userId: user?.id,
  role: profile?.role,
  timestamp: new Date().toISOString(),
}));
```

- [ ] Log all errors with enough context to debug without exposing sensitive data
- [ ] Vercel's built-in log viewer is sufficient for MVP — no external logging tool needed yet

### Performance

- [ ] Confirm all foreign key columns have indexes (already in migration, verify)
- [ ] Confirm `member_payment_summary` view returns in < 500ms for 200 members — test in Supabase SQL Editor
- [ ] Add `revalidate = 60` to the Treasurer dashboard route (already noted in Phase 4)
- [ ] Confirm list endpoints never return more than 100 rows (`pageSize` cap in pagination helper)

### Deployment Checklist

- [ ] Set all production env vars in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ALLOWED_ORIGIN` (your Vercel domain)
- [ ] Run migration on production Supabase project (separate from dev)
- [ ] Seed production colleges and academic periods
- [ ] Create initial Treasurer account via Supabase Auth dashboard
- [ ] Confirm Supabase is on a paid plan if storage or auth emails are needed at scale
- [ ] Disable Supabase dashboard SQL Editor access for non-admin team members after go-live
- [ ] Set up Vercel deployment protection (password or allowed IPs) during UAT phase

### Final QA Matrix

| Scenario | Expected | Pass? |
|---|---|---|
| Hit any route with no JWT | `401 UNAUTHORIZED` | |
| Hit treasurer route as member | `403 FORBIDDEN` | |
| POST payment with invalid UUID | `400 VALIDATION_ERROR` | |
| POST duplicate membership fee | `409 CONFLICT` | |
| GET member list as member role | `403 FORBIDDEN` | |
| GET own payment history as member | `200` with own data only | |
| GET another member's history as member | `403 FORBIDDEN` | |
| POST report as member | `403 FORBIDDEN` | |
| Deactivate member with payments | `200`, payments preserved | |
| Dashboard with zero members | `200` with all zeros | |

---

*GFAST-MPTS Backend Development Phases v1.0*
*Confidential — For Internal Use Only*
