# GFAST-MPTS Frontend Implementation Phases

This document guides the frontend developer through implementing all pages and features in the correct order.  
Each phase builds on the previous one. Do not skip phases.

> **Stack:** Next.js 16 (App Router) · TypeScript · TanStack Query · Supabase SSR · Tailwind CSS · shadcn/ui  
> **Architecture:** 4-layer — Domain → Data → Application → Presentational  
> **Theme tokens:** Import from `@/theme` — never hardcode colors, spacing, or font sizes

---

## Architecture Quick Reference

```
Layer 1 — Domain          features/*/types/         Pure TS types + Zod schemas. No React, no Supabase.
Layer 2 — Data            features/*/repositories/   Supabase calls + DB → TS mapping. No React.
Layer 3 — Application     features/*/hooks/          TanStack Query hooks. useQuery / useMutation.
Layer 4 — Presentational  features/*/components/     React components. app/(group)/pages. No direct Supabase.
                          app/(auth|treasurer|member)/
```

**Rules:**
- Components (Layer 4) call hooks (Layer 3) only — never call repositories or Supabase directly from a component
- Repositories (Layer 2) use `supabase` browser client from `@/lib/supabase/client`
- API routes (server-side) use `createSupabaseServer(req)` from `@/lib/supabase/server`
- All API responses follow the standard envelope: `{ success, data, meta? }` or `{ success, error }`

---

## Phase 1 — Authentication

**Goal:** Users can log in, be redirected by role, and log out securely.

### Routes to implement
- `/login` → `app/(auth)/login/page.tsx`
- `/unauthorized` → `app/unauthorized/page.tsx`
- `/` → `app/page.tsx` (already done: redirects to `/login`)

### What to build

**Login page** (`app/(auth)/login/page.tsx`):
- Email + password form
- On submit: call `authRepository.signIn(email, password)` — already implemented in `features/auth/repositories/auth.repository.ts`
- On success: read `user.role` from `AuthUser`, redirect
  - `role === "TREASURER"` → `/treasurer/overview`
  - `role === "MEMBER"` → `/member/dashboard`
- On error: show inline error (wrong credentials, account not found)
- Show loading state while submitting

**Unauthorized page** (`app/unauthorized/page.tsx`):
- Static message: user lacks required permission
- Button to return to login

### Hooks available
- `useAuth()` — returns `{ user: AuthUser | null, isLoading, isAuthenticated }`
- `useRequireRole("TREASURER")` — redirects to `/login` if unauthenticated, `/unauthorized` if wrong role
- `useSignOut()` — returns `{ signOut }` function, redirects to `/login` after sign out

### Data types
- `AuthUser` — `{ id, email, role: UserRole, memberId: string | null }`
- `UserRole` — `"MEMBER" | "TREASURER" | "ADMIN"` (from client-side user_metadata)

### Business rules
- Treasurer accounts have `role = "TREASURER"` and `memberId = null` (no linked member record)
- Member accounts have `role = "MEMBER"` and `memberId` set only after they accept an invite
- Session is persisted automatically by Supabase (localStorage)

---

## Phase 2 — App Shell & Navigation

**Goal:** Both roles have a working shell layout with sidebar navigation and a sign-out button.

### Routes/layouts to implement
- `app/(treasurer)/layout.tsx` — already guards with `useRequireRole("TREASURER")`
- `app/(member)/layout.tsx` — already guards with `useRequireRole("MEMBER")`

### What to build

**AppShell** (`components/layout/AppShell/AppShell.tsx`):
- Wraps page content with Sidebar + TopNav
- Props: `{ navItems: NavItem[], children }`

**Sidebar** (`components/layout/AppShell/Sidebar.tsx`):
- Renders navigation links from `navItems`
- Highlight active route (use Next.js `usePathname()`)
- Logo / app name at top
- Signed-in user name + sign out button at bottom

**TopNav** (`components/layout/AppShell/TopNav.tsx`):
- Mobile hamburger menu toggle
- Page title (can be passed as prop or derived from route)
- User avatar/name

**Treasurer nav items:**
```
/treasurer/overview    "Overview"
/treasurer/members     "Members"
/treasurer/payments    "Payments"
/treasurer/reports     "Reports"
```

**Member nav items:**
```
/member/dashboard      "My Dashboard"
```

### Data types
- `NavItem` — `{ href: string, label: string }` (already defined in `Sidebar.tsx`)

### Business rules
- If `isLoading` is true in layout, render nothing or a skeleton (layout already has this logic)
- Sign out must call `useSignOut()` — never call Supabase directly from a component

---

## Phase 3 — Reference Data Layer

**Goal:** Shared data needed by multiple features is loaded once and cached.

These hooks must exist before Phase 4+ because forms and filters depend on them.

### What to build

**`useColleges()`** — already implemented in `lib/hooks/useColleges.ts`
- Endpoint: `GET /api/colleges`
- Returns: `College[]` sorted by name
- Stale time: 5 minutes (colleges rarely change)
- Used by: member create/edit form, payment summary filter, report filter

**`useAcademicPeriods()`** — create in `lib/hooks/useAcademicPeriods.ts`
- Endpoint: `GET /api/academic-periods`
- Returns: `AcademicPeriod[]` sorted year DESC, month DESC (most recent first)
- Used by: payment recording form (monthly dues period picker)

**`useCurrentRates()`** — create in `features/dues-configurations/hooks/useCurrentRates.ts`
- Endpoint: `GET /api/dues-configurations/current`
- Returns: `CurrentRates` map (keyed `MEMBERSHIP_FEE_FULL_TIME`, `MONTHLY_DUES_FULL_TIME`, `MONTHLY_DUES_ASSOCIATE`)
- Used by: payment recording form to pre-fill expected amount

### Data types
```typescript
interface College         { id, name, code }
interface AcademicPeriod  { id, label, month, year, isActive }
interface CurrentRates    { MEMBERSHIP_FEE_FULL_TIME?, MONTHLY_DUES_FULL_TIME?, MONTHLY_DUES_ASSOCIATE? }
```

### Integration pattern
All three use the browser Supabase client indirectly via the API route (Bearer token from `supabase.auth.getSession()`).  
Fetch via the API routes, not directly from Supabase, to go through server-side auth.

---

## Phase 4 — Treasurer Dashboard Overview

**Goal:** Treasurer can see aggregate collection stats at a glance.

### Route
- `app/(treasurer)/overview/page.tsx`

### What to build

**`useTreasurerDashboard()`** — create in `features/payments/hooks/useTreasurerDashboard.ts`
- Endpoint: `GET /api/dashboard/treasurer`
- Returns: `TreasurerDashboard`

**`DashboardStatsCard`** (`features/payments/components/DashboardStatsCard/`):
- Displays a single stat: label + value + optional subtitle
- Used for: Total Members, Total Collected, Members with Balance, Members Complete

**`CollectionProgressBar`** (`features/payments/components/CollectionProgressBar/`):
- Shows collection progress per college
- Inputs: `{ collegeName, total, memberCount }`

**Overview page layout:**
- 4 stat cards in a grid row
- Collection by college section (one progress bar per college)
- Quick link to Members page and Payments page

### Data types
```typescript
interface TreasurerDashboard {
  totalMembers: number
  totalCollected: number
  membersWithBalance: number
  membersComplete: number
  collectionByCollege: { collegeId, collegeName, total, memberCount }[]
}
```

### Business rules
- Dashboard data is cached server-side for 60 seconds — no need to refetch on every visit
- `totalCollected` is in Philippine Peso — format as `₱ 1,250.00`

---

## Phase 5 — Member Management (Treasurer)

**Goal:** Treasurer can view, create, edit, and deactivate members.

### Routes
- `app/(treasurer)/members/page.tsx` — member list
- `app/(treasurer)/members/[id]/page.tsx` — member detail

### What to build

#### Member List page

**`useMembers(filter?)`** — already implemented in `features/members/hooks/useMembers.ts`  
*(Note: this hook uses the legacy repository — update to call `GET /api/members` via fetch with Bearer token)*

**New `useApiMembers(filter?)`** — create in `features/members/hooks/useApiMembers.ts`
- Endpoint: `GET /api/members` with query params from `MemberListQuery`
- Returns: `{ data: Member[], meta: PaginationMeta }`
- Supports: search, college filter, memberType filter, pagination, sort

**`MemberList`** (`features/members/components/MemberList/`):
- Table of members: Full Name, College, Member Type, Employee ID, Status, Actions
- Search bar (debounced input — wait 300ms before querying)
- Filter dropdowns: College (from `useColleges()`), Member Type, Active/Inactive toggle
- Pagination controls
- "Add Member" button → opens `CreateMemberModal`
- Row click → navigates to `/treasurer/members/:id`

**`CreateMemberModal`** (`features/members/components/CreateMemberModal/`):
- Form fields: Full Name, Email, College (select from `useColleges()`), Member Type, Employee ID, Joined Date, Notes
- Submit: `POST /api/members`
- On success: close modal, invalidate `["members"]` query key
- Show validation errors inline

**`useCreateMember()`** — create in `features/members/hooks/useCreateMember.ts`
- Mutation: `POST /api/members` with `CreateMemberInput`
- On success: `queryClient.invalidateQueries({ queryKey: ["members"] })`

#### Member Detail page

**`useMember(id)`** — create in `features/members/hooks/useMember.ts`
- Endpoint: `GET /api/members/:id`
- Returns: single `Member`

**Member detail page layout:**
- Member info card: name, email, college, type, employee ID, joined date, notes
- Status badge (active / inactive)
- Edit button → opens `EditMemberModal`
- Deactivate button (with confirmation dialog) → `PATCH /api/members/:id/deactivate`
- Payment history section → `GET /api/payments/member/:memberId` (Phase 6)
- Invite button → `POST /api/auth/invite` (Phase 9)

**`EditMemberModal`** (`features/members/components/EditMemberModal/`):
- Pre-fills form with current member data
- Submit: `PATCH /api/members/:id` with only changed fields
- On success: close modal, invalidate `["members", id]` query key

**`useUpdateMember(id)`** — already exists in `features/members/hooks/useUpdateMember.ts`  
*(Update to call the API route)*

**`useDeactivateMember(id)`** — create in `features/members/hooks/useDeactivateMember.ts`
- Mutation: `PATCH /api/members/:id/deactivate`
- On success: invalidate member queries

### Data types
- `Member`, `CreateMemberInput`, `UpdateMemberInput`, `MemberListQuery` — see API_MODELS.md

### Business rules
- Deactivation is permanent from the UI (no reactivation flow)
- Deactivated members should still appear in payment history
- `isActive` defaults to `true` in the list query — toggle to show inactive members
- College picker must use `useColleges()` — never hardcode college options

---

## Phase 6 — Payment Recording & Tracking (Treasurer)

**Goal:** Treasurer can record payments and view full payment history and summaries.

### Routes
- `app/(treasurer)/payments/page.tsx` — payment tracking overview

### What to build

#### Payment Summaries view (main payments page)

**`usePaymentSummaries(filter?)`** — create in `features/payments/hooks/usePaymentSummaries.ts`
- Endpoint: `GET /api/payments/summaries` with `PaymentSummaryQuery`
- Returns: `{ data: PaymentSummaryRow[], meta: PaginationMeta }`

> **⚠️ Note:** `PaymentSummaryRow` fields are **snake_case** (raw from DB view).  
> Create a mapper in `features/payments/repositories/payment-summary.mapper.ts` to convert to camelCase before use in components.

**`PaymentTable`** (`features/payments/components/PaymentTable/`):
- Columns: Member Name, College, Type, Membership Fee (✓/✗), Periods Paid / Expected, Outstanding Balance, Status, Actions
- Filter bar: College, Member Type, Status (COMPLETE / HAS_BALANCE), Has Membership Fee toggle, Month filter, Year filter
- Search: member name
- "Record Payment" button per row (or global) → opens `RecordPaymentModal`

**`PaymentStatusBadge`** (`features/payments/components/PaymentStatusBadge/`):
- `COMPLETE` → green badge ("All Paid")
- `HAS_BALANCE` → red badge ("Has Balance")
- Colors from `@/theme`: `colors.status.paid` and `colors.status.outstanding`

#### Record Payment

**`useRecordPayment()`** — create in `features/payments/hooks/useRecordPayment.ts`
- Mutation: `POST /api/payments` with `RecordPaymentInput`
- On success: invalidate `["payments"]`, `["payment-summaries"]`, `["dashboard-treasurer"]`

**`RecordPaymentModal`** (`features/payments/components/RecordPaymentModal/`):
- Pre-select member if opened from a specific row
- Fields:
  - Member (searchable select, from `useApiMembers()`)
  - Payment Type: MEMBERSHIP_FEE or MONTHLY_DUES
  - Amount (pre-fill from `useCurrentRates()` based on member type + payment type)
  - Payment Date (date picker, default today)
  - Academic Period (select from `useAcademicPeriods()`, only shown when MONTHLY_DUES)
  - Reference Number (optional)
  - Notes (optional)
- Validation: amount > 0, academic period required for MONTHLY_DUES
- On success: show toast, close modal, refresh table

#### Payment History (used in member detail page from Phase 5)

**`usePaymentHistory(memberId, filter?)`** — create in `features/payments/hooks/usePaymentHistory.ts`
- Endpoint: `GET /api/payments/member/:memberId` with `PaymentHistoryQuery`
- Returns: `{ data: PaymentRecord[], meta: PaginationMeta }`

**`PaymentHistoryTable`** (`features/payments/components/PaymentHistoryTable/`):
- Columns: Date, Type, Amount, Academic Period, Reference #, Notes
- Used in both member detail page (Phase 5) and member dashboard (Phase 8)

### Data types
- `PaymentRecord`, `RecordPaymentInput`, `PaymentSummaryRow`, `PaymentSummaryQuery` — see API_MODELS.md

### Business rules
- Amount field should pre-fill from `CurrentRates` but allow override
- Duplicate payments are blocked server-side (409 CONFLICT) — show error toast with the server message
- `months_paid` is an array of month numbers: `[1, 2, 3]` = Jan, Feb, Mar paid
- Format currency as `₱ 1,250.00` consistently

---

## Phase 7 — Reports (Treasurer)

**Goal:** Treasurer can generate collection reports in JSON, Excel, or PDF format.

### Route
- `app/(treasurer)/reports/page.tsx`

### What to build

**`useGenerateReport()`** — create in `features/reports/hooks/useGenerateReport.ts`
- Mutation: `POST /api/reports/generate` with `GenerateReportInput`
- For `format = "json"`: parse response as `ReportData`, display inline
- For `format = "excel"` or `"pdf"`: receive as blob, trigger browser file download

**Reports page layout:**
- Form: Year input (number, default current year), Format selector (JSON / Excel / PDF), College filter (optional, from `useColleges()`)
- "Generate Report" button → shows loading spinner while generating
- For JSON: render report inline as a summary card + member table
- For Excel/PDF: automatic file download, show success toast

**File download pattern for Excel/PDF:**
```
1. Fetch POST /api/reports/generate with { year, format, collegeId? }
2. Read response as blob: await response.blob()
3. const url = URL.createObjectURL(blob)
4. Create <a href={url} download="filename.xlsx"> and click programmatically
5. Revoke URL after: URL.revokeObjectURL(url)
```

### Data types
```typescript
interface GenerateReportInput { year: number, format: ReportFormat, collegeId?: string }
interface ReportData { generatedAt, year, college, totalMembers, totalCollected, members: ReportMemberRow[] }
```

### Business rules
- Year must be between 2020 and 2099
- Report data reflects **current standing** — the `member_payment_summary` view does not filter by year  
  (year is metadata only, not a data filter)
- PDF and Excel generation happens server-side; the client just receives the file

---

## Phase 8 — Member Self-Service Dashboard

**Goal:** A logged-in member can view their own payment standing.

### Route
- `app/(member)/dashboard/page.tsx`

### What to build

**`useMemberDashboard()`** — create in `features/members/hooks/useMemberDashboard.ts`
- Endpoint: `GET /api/dashboard/member` (no params — always returns caller's own record)
- Returns: `MemberDashboard`

**`MemberDashboard`** (`features/members/components/MemberDashboard/`):
- Header: member name, college, member type
- Membership fee status card: paid ✓ or unpaid ✗ with amount owed (from `useCurrentRates()`)
- Monthly dues progress: `periodsPaid / periodsExpected` with visual indicator
- Months paid: visual calendar grid showing which months are paid
- Outstanding balance: highlighted if > 0
- Status badge: COMPLETE (green) or HAS BALANCE (red)
- Payment history section → `PaymentHistoryTable` with their own memberId

**`MemberCard`** (`features/members/components/MemberCard/`):
- Compact card showing member name, college, type, status

**`StandingBadge`** (`features/members/components/StandingBadge/`):
- Visual badge for `COMPLETE` or `HAS_BALANCE` status
- Use `colors.status.paid` and `colors.status.outstanding` from `@/theme`

### Data types
```typescript
interface MemberDashboard {
  memberId, fullName, college, memberType,
  membershipFeePaid, periodsExpected, periodsPaid, monthsPaid,
  outstandingBalance, status, lastPaymentDate
}
```

### Business rules
- `GET /api/dashboard/member` requires the caller to have a linked member record  
  (`members.profile_id = auth.uid()`). Members created via the invite flow will have this.
- If `membershipFeePaid = false` and `memberType = "FULL_TIME"`: show membership fee as the first priority
- `ASSOCIATE` members never see a membership fee row

---

## Phase 9 — Member Invite Flow (Polish)

**Goal:** Treasurer can send an invite email to a faculty member so they can create their login.

### What to build

**`useInviteMember()`** — create in `features/auth/hooks/useInviteMember.ts`
- Mutation: `POST /api/auth/invite` with `InviteInput`
- On success: show toast "Invite sent to {email}"

**Invite button** — add to the member detail page (Phase 5):
- Only show if `member.profileId === null` (no linked account yet)
- Opens confirmation dialog showing the member's email
- On confirm: call `useInviteMember()` with `{ email, fullName, memberId }`

### Data types
```typescript
interface InviteInput { email: string, fullName: string, memberId: string }
```

### Business rules
- Invite is rate-limited server-side: 5 per 5 minutes per IP
- If 409 CONFLICT: member email already has a Supabase auth account — show specific error
- Once the invited user signs up, `members.profile_id` will be set automatically via the Supabase trigger

---

## Phase 10 — Dues Configuration Management (Optional / Advanced)

**Goal:** Treasurer can view and set membership/dues rates.

### What to build

**`useDuesConfigurations(filter?)`** — create in `features/dues-configurations/hooks/useDuesConfigurations.ts`
- Endpoint: `GET /api/dues-configurations` with optional filters
- Filter: `activeOnly` (default `true`)

**`useCreateDuesConfig()`** — create in `features/dues-configurations/hooks/useCreateDuesConfig.ts`
- Mutation: `POST /api/dues-configurations` with `CreateDuesConfigInput`
- On success: invalidate dues-configurations and current-rates queries

**Dues configuration page** (create route `app/(treasurer)/dues/page.tsx` if needed):
- Table of active rates: Payment Type, Member Type, Amount, Effective From
- "Set New Rate" button → form to create a new rate
- Warning: setting a new rate closes the current one automatically

### Business rules
- Never allow editing or deleting existing rate records — append-only
- Validate: `ASSOCIATE` cannot have `MEMBERSHIP_FEE`
- Effective date cannot be in the past (UX recommendation, not enforced by API)

---

## Routing Summary

```
/                           → redirects to /login
/login                      → (auth)/login/page.tsx
/unauthorized               → unauthorized/page.tsx

/treasurer/overview         → (treasurer)/overview/page.tsx       [TREASURER only]
/treasurer/members          → (treasurer)/members/page.tsx
/treasurer/members/:id      → (treasurer)/members/[id]/page.tsx
/treasurer/payments         → (treasurer)/payments/page.tsx
/treasurer/reports          → (treasurer)/reports/page.tsx

/member/dashboard           → (member)/dashboard/page.tsx         [MEMBER only]
```

---

## State Management Summary

| Data | Hook | Cache Key | Stale Time |
|---|---|---|---|
| Auth session | `useAuth()` | Supabase managed | — |
| Colleges | `useColleges()` | `["colleges"]` | 5 min |
| Academic periods | `useAcademicPeriods()` | `["academic-periods"]` | 5 min |
| Current dues rates | `useCurrentRates()` | `["current-rates"]` | 5 min |
| Member list | `useApiMembers(filter)` | `["members", filter]` | 1 min |
| Single member | `useMember(id)` | `["members", id]` | 1 min |
| Treasurer dashboard | `useTreasurerDashboard()` | `["dashboard-treasurer"]` | 1 min |
| Member dashboard | `useMemberDashboard()` | `["dashboard-member"]` | 1 min |
| Payment summaries | `usePaymentSummaries(filter)` | `["payment-summaries", filter]` | 1 min |
| Payment history | `usePaymentHistory(id, filter)` | `["payment-history", id, filter]` | 1 min |
| Dues configs | `useDuesConfigurations(filter)` | `["dues-configurations", filter]` | 5 min |

---

## Integration Checklist per Phase

Before marking a phase complete, verify:

- [ ] Auth header is sent on all API calls (`Authorization: Bearer <token>`)
- [ ] Loading states are handled (skeleton or spinner)
- [ ] Error states are handled (show message, not a crash)
- [ ] Success mutations invalidate the relevant query keys
- [ ] All forms validate client-side before submitting
- [ ] Currency is formatted as `₱ X,XXX.XX`
- [ ] Dates are displayed in readable format (`MMM D, YYYY`), stored as ISO
- [ ] Components use theme tokens from `@/theme`, not raw CSS values
- [ ] No Supabase calls in components — only in repositories
- [ ] 404 from API → show "not found" message, not a crash
- [ ] 403 from API → redirect to `/unauthorized`
- [ ] 401 from API → redirect to `/login` (session expired)
