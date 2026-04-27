# GitHub Copilot Instructions — GCFast-MPTS Backend

**Project:** Next.js 15 + TypeScript + Supabase backend following GFAST_BACKEND_PHASES.md standards

---

## CRITICAL RULES

### File Size Limit (NON-NEGOTIABLE)
- **MAX 500 lines per file** — NO EXCEPTIONS
- When a file approaches 450 lines, extract utilities/helpers into separate files
- Prefer many small focused files over few large ones
- High cohesion, low coupling

### Architecture Patterns (ALWAYS ENFORCE)

#### 1. Response Envelope (EVERY API ROUTE)
```typescript
// Success
{ success: true, data: {...}, meta?: {...} }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "...", details?: {...} } }
```

#### 2. Route Handler Pattern (STANDARD TEMPLATE)
```typescript
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse } from "@/lib/utils/api-response";

export const GET = apiHandler(async (req: Request) => {
  // 1. Auth check
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;
  
  // 2. Role check (if needed) — pass authenticated user for defense-in-depth
  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;
  
  // 3. Validation
  const parsed = validate(schema, data);
  if (!parsed.success) return parsed.response;
  
  // 4. Business logic
  const result = await repository.method();
  
  // 5. Return
  return successResponse(result);
});
```

#### 3. Validation (ALWAYS BEFORE DATABASE)
- Every request body/query params validated with Zod
- Use `validate()` helper from `lib/utils/validate.ts`
- Return `400` on validation failure — never touch database with bad data

#### 4. Pagination (ALWAYS FOR LISTS)
- Default 20 items, max 100 per page
- Use `toRange()` and `buildMeta()` from `lib/utils/pagination.ts`
- Response includes `meta: { count, page, pageSize, hasMore }`

```typescript
const { from, to } = toRange({ page, pageSize });
const { data, count } = await supabase
  .from("table")
  .select("*", { count: "exact" })
  .range(from, to);

return successResponse(data, buildMeta(count ?? 0, { page, pageSize }));
```

#### 5. Filtering (DB-DRIVEN, NOT JS)
- Use `applySearch()` and `applySorting()` from `lib/utils/query-builder.ts`
- Whitelist sort fields — never allow arbitrary column names (SQL injection prevention)
- All filters applied via Supabase query builder — never fetch all then filter in JS

```typescript
let query = supabase.from("table").select("*");

if (collegeId) query = query.eq("college_id", collegeId);
if (search) query = applySearch(query, search, ["full_name", "email"]);
query = applySorting(query, sortBy, sortOrder, ["full_name", "created_at"]);

const { data } = await query;
```

#### 6. Security
- **All UUIDs** — never auto-increment IDs exposed in API
- All routes protected by `withAuth` middleware
- Treasurer-only routes use `withRole("treasurer")`
- RLS is last line of defense — always enabled on tables
- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to client**
- Service role client (`lib/supabase/admin.ts`) **ONLY in API routes** — never client components

#### 7. Error Handling
- Use `ErrorCodes` constants from `lib/types/error-codes.ts`
- Never expose raw database errors to client
- All routes wrapped in `apiHandler()` for unhandled error catching

```typescript
import { ErrorCodes } from "@/lib/types/error-codes";
import { errorResponse } from "@/lib/utils/api-response";

return errorResponse(ErrorCodes.NOT_FOUND, "Member not found", 404);
```

#### 8. Naming Conventions
- **Database:** `snake_case` (tables, columns)
- **API routes:** `kebab-case` URLs (`/api/payment-summaries`)
- **TypeScript:** `camelCase` (variables, functions), `PascalCase` (types, interfaces)
- **Mappers:** Convert DB `snake_case` → TS `camelCase` at repository layer

---

## File Organization

```
lib/
  middleware/          # withAuth, withRole
  supabase/           # client, server, admin
  utils/              # api-response, api-handler, validate, pagination, query-builder
  types/              # shared.types, error-codes, api-types
  repositories/       # data access layer (one per table/feature)
features/
  [feature]/
    types/            # Zod schemas, TypeScript types
    repositories/     # feature-specific data access
    components/       # feature UI components
app/
  api/                # API routes (max 200 lines each)
```

---

## When Generating Code

1. **Check file line count BEFORE adding code**
2. **Extract to new file if approaching 500 lines**
3. **Follow response envelope pattern religiously**
4. **Validate ALL inputs with Zod**
5. **Reference `docs/apidocs/GFAST_BACKEND_PHASES.md` for detailed standards**

---

## Supabase Client Usage

| Client | Use Case | Import |
|---|---|---|
| `supabase` (browser) | Client components, hooks | `@/lib/supabase/client` |
| `createSupabaseServer()` | API routes, Server Components | `@/lib/supabase/server` |
| `supabaseAdmin` | Admin operations (SPARINGLY) | `@/lib/supabase/admin` |

**CRITICAL:** Never import `admin.ts` in `/app` client components — only in API routes.

---

## Example: Complete API Route

```typescript
// app/api/members/route.ts
import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse } from "@/lib/utils/api-response";
import { toRange, buildMeta } from "@/lib/utils/pagination";
import { createSupabaseServer } from "@/lib/supabase/server";
import { memberFilterSchema } from "@/features/members/types/member.schemas";

export const GET = apiHandler(async (req: Request) => {
  // 1. Auth
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  // 2. Role
  const roleResult = await withRole(authResult, "treasurer");
  if (!roleResult.success) return roleResult.response;

  // 3. Validate query params
  const { searchParams } = new URL(req.url);
  const parsed = validate(
    memberFilterSchema,
    Object.fromEntries(searchParams)
  );
  if (!parsed.success) return parsed.response;

  const { page, pageSize, sortBy, sortOrder, ...filters } = parsed.data;

  // 4. Query database
  const supabase = await createSupabaseServer();
  const { from, to } = toRange({ page, pageSize });

  let query = supabase
    .from("members")
    .select("*", { count: "exact" })
    .range(from, to);

  if (filters.collegeId) query = query.eq("college_id", filters.collegeId);
  query = query.order(sortBy ?? "full_name", { ascending: sortOrder === "asc" });

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  // 5. Return
  return successResponse(data, buildMeta(count ?? 0, { page, pageSize }));
});
```

---

## Standards Reference

For full details, see: `docs/apidocs/GFAST_BACKEND_PHASES.md`
