# GFAST-MPTS API Models

These TypeScript interfaces are derived directly from the live backend routes and DB schema.  
All API responses follow the standard envelope — see [API_REFERENCE.md](./API_REFERENCE.md) for envelope details.

> **Base URL (dev):** `http://localhost:3000`  
> **Auth:** All protected endpoints require `Authorization: Bearer <access_token>`.  
> Get the token from `supabase.auth.getSession()` → `session.access_token`.

---

## Shared Types & Enums

```typescript
// Roles used in API responses (lowercase — as stored in profiles table)
export type ApiUserRole = "treasurer" | "member";

// Roles used in client-side auth hooks (uppercase — from user_metadata)
export type UserRole = "MEMBER" | "TREASURER" | "ADMIN";

export type MemberType    = "FULL_TIME" | "ASSOCIATE";
export type PaymentStatus = "COMPLETE" | "HAS_BALANCE";
export type PaymentType   = "MEMBERSHIP_FEE" | "MONTHLY_DUES";
export type ReportFormat  = "json" | "excel" | "pdf";
```

---

## Standard Response Envelope

Every JSON response from the API follows one of these two shapes:

```typescript
// Success (single resource or list)
interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta; // only present on list endpoints
}

// Error
interface ApiError {
  success: false;
  error: {
    code: string;        // machine-readable (e.g. "NOT_FOUND", "VALIDATION_ERROR")
    message: string;     // human-readable
    details?: unknown;   // optional: field-level Zod validation errors
  };
}
```

### Pagination Meta (list endpoints)

```typescript
interface PaginationMeta {
  count: number;    // total items matching filter across ALL pages
  page: number;     // current page, 1-based
  pageSize: number; // items returned on this page
  hasMore: boolean; // true if more pages exist
}
```

### Common Error Codes

| Code | HTTP | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | No or invalid Bearer token |
| `FORBIDDEN` | 403 | Authenticated but wrong role or IDOR attempt |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate email, already deactivated, duplicate payment, etc. |
| `VALIDATION_ERROR` | 400 | Zod schema failure (bad body or query params) |
| `INVALID_UUID` | 400 | URL param is not a valid UUID |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## Auth Models

### `AuthMe` — `GET /api/auth/me`

```typescript
interface AuthMe {
  id: string;              // profiles.id (= Supabase auth user id)
  email: string;
  fullName: string;        // profiles.full_name
  role: ApiUserRole;       // "treasurer" | "member"
  memberId: string | null; // members.id linked via members.profile_id
                           // null if account not yet linked to a member record
}
```

### `AuthUser` — client-side session shape

Used by `useAuth()` hook (`features/auth/types/auth.types.ts`):

```typescript
interface AuthUser {
  id: string;
  email: string;
  role: UserRole;          // "MEMBER" | "TREASURER" | "ADMIN" — from user_metadata
  memberId: string | null; // from user_metadata.member_id (set when invite is accepted)
}
```

> **Note:** `AuthUser.role` comes from Supabase `user_metadata` (uppercase).  
> The API's `AuthMe.role` is read from the `profiles` table (lowercase).  
> Treasurer accounts created directly will have `memberId: null` in both.

### Invite Input — `POST /api/auth/invite` (treasurer only)

```typescript
interface InviteInput {
  email: string;    // must be unique in auth system
  fullName: string; // 2–100 chars
  memberId: string; // UUID — must be an existing members.id
}
// Response: 201 { success: true, data: { message: "Invite sent" } }
// Error 409 if email already registered in Supabase Auth
// Rate limited: 5 invites per 5 minutes per IP
```

### Sign Out — `POST /api/auth/signout`

```typescript
// No body required.
// Response: 200 { success: true, data: { message: "Signed out successfully" } }
```

---

## Reference Data Models

### `College` — `GET /api/colleges`

```typescript
interface College {
  id: string;   // UUID
  name: string; // e.g. "College of Information and Communications Technology"
  code: string; // short code, e.g. "CICT"
}
// Access: any authenticated user (both roles)
// Response: { success: true, data: College[] }
// Sorted: name ASC
```

### `AcademicPeriod` — `GET /api/academic-periods`

```typescript
interface AcademicPeriod {
  id: string;       // UUID
  label: string;    // e.g. "December 2025"
  month: number;    // 1–12
  year: number;     // e.g. 2025
  isActive: boolean;
}
// Access: any authenticated user
// Response: { success: true, data: AcademicPeriod[] }
// Sorted: year DESC, month DESC (most recent first)
```

---

## Member Models

### `Member` — response from GET/POST/PATCH member endpoints

```typescript
interface Member {
  id: string;              // UUID
  profileId: string | null; // null until member accepts invite and links account
  collegeId: string;       // UUID
  collegeName?: string;    // resolved from colleges JOIN
  collegeCode?: string;    // resolved from colleges JOIN
  employeeId?: string;     // faculty employee ID (optional)
  fullName: string;
  email: string;
  memberType: MemberType;  // "FULL_TIME" | "ASSOCIATE"
  joinedAt?: string;       // ISO Date YYYY-MM-DD
  isActive: boolean;
  notes?: string;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

> **Access rules:**  
> - List (`GET /api/members`) — treasurer only  
> - Single (`GET /api/members/:id`) — treasurer OR the member whose `profile_id` matches the caller  
> - Create, Update, Deactivate — treasurer only

### `CreateMemberInput` — `POST /api/members` body

```typescript
interface CreateMemberInput {
  fullName: string;       // required, 2–100 chars
  email: string;          // required, unique across members table
  collegeId: string;      // UUID, must exist in colleges
  memberType: MemberType; // required
  employeeId?: string;    // max 50 chars
  joinedAt?: string;      // ISO Date YYYY-MM-DD
  notes?: string;         // max 500 chars
}
// Response: 201 { success: true, data: Member }
// Error 409 CONFLICT if email already exists
// Error 400 VALIDATION_ERROR if collegeId does not exist
```

### `UpdateMemberInput` — `PATCH /api/members/:id` body

```typescript
type UpdateMemberInput = Partial<CreateMemberInput>;
// All fields optional — only provided fields are updated
// Response: 200 { success: true, data: Member }
```

### Deactivate — `PATCH /api/members/:id/deactivate`

```typescript
// No body required. Method must be PATCH (not POST).
// Response: 200 { success: true, data: { message: "Member deactivated successfully" } }
// Error 409 CONFLICT if member is already inactive
// This is a SOFT DELETE — payment history is preserved
```

### `MemberListQuery` — query params for `GET /api/members`

```typescript
interface MemberListQuery {
  page?: number;       // 1-based, default 1
  pageSize?: number;   // default 20, max 100
  sortBy?: "full_name" | "joined_at" | "college_name"; // default "full_name"
  sortOrder?: "asc" | "desc";   // default "asc"
  search?: string;     // full-text search on full_name and email (max 100 chars)
  collegeId?: string;  // UUID filter
  memberType?: MemberType;
  isActive?: boolean;  // default true (active members only)
}
```

---

## Payment Models

### `PaymentRecord` — response from `GET /api/payments` and `POST /api/payments`

```typescript
interface PaymentRecord {
  id: string;                     // UUID
  memberId: string;               // UUID
  paymentType: PaymentType;
  amountPaid: number;
  paymentDate: string;            // ISO Date YYYY-MM-DD
  academicPeriodId: string | null; // null for MEMBERSHIP_FEE payments
  referenceNumber: string | null;
  notes: string | null;
  recordedBy: string;             // UUID — treasurer user id who recorded it
  createdAt: string;              // ISO 8601
}
```

### `RecordPaymentInput` — `POST /api/payments` body

```typescript
interface RecordPaymentInput {
  memberId: string;               // UUID — must be an active member
  paymentType: PaymentType;
  amountPaid: number;             // must be > 0
  paymentDate: string;            // ISO Date YYYY-MM-DD
  academicPeriodId?: string;      // UUID — REQUIRED when paymentType = "MONTHLY_DUES"
  referenceNumber?: string;       // max 100 chars
  notes?: string;                 // max 500 chars
}
// Response: 201 { success: true, data: PaymentRecord }
// Error 404 if member not found or inactive
// Error 400 if academicPeriodId missing for MONTHLY_DUES
// Error 409 if duplicate (membership fee already recorded for member,
//            or this member already paid this academic period)
```

### `PaymentRecordQuery` — query params for `GET /api/payments`

```typescript
interface PaymentRecordQuery {
  page?: number;           // default 1
  pageSize?: number;       // default 20, max 100
  memberId?: string;       // UUID — filter to a specific member's payments
  paymentType?: PaymentType;
}
// Access: treasurer only
// Sorted: createdAt DESC (newest first)
```

### `PaymentHistoryQuery` — query params for `GET /api/payments/member/:memberId`

```typescript
interface PaymentHistoryQuery {
  page?: number;     // default 1
  pageSize?: number; // default 20, max 100
  paymentType?: PaymentType;
  year?: number;     // e.g. 2025
  sortBy?: "payment_date" | "amount_paid"; // default "payment_date"
  sortOrder?: "asc" | "desc";             // default "desc" (most recent first)
}
// Access: treasurer OR the member whose record it is (IDOR protected)
// Response: { success: true, data: PaymentRecord[], meta: PaginationMeta }
```

### `PaymentSummaryRow` — `GET /api/payments/summaries`

> ⚠️ This endpoint returns **raw snake_case** directly from the `member_payment_summary` DB view.  
> Map to camelCase in the repository layer before using in components.

```typescript
interface PaymentSummaryRow {
  member_id: string;
  full_name: string;
  email: string;
  employee_id: string | null;
  member_type: MemberType;
  joined_at: string | null;                // ISO Date YYYY-MM-DD
  college_id: string;
  college_name: string;
  college_code: string;
  membership_fee_paid: boolean;
  membership_fee_amount_paid: number;
  periods_paid: number;                    // number of dues periods paid
  periods_expected: number;               // total dues periods expected
  months_paid: number[];                  // array of month numbers e.g. [1, 2, 3]
  total_dues_paid: number;
  last_payment_date: string | null;        // ISO Date YYYY-MM-DD
  outstanding_balance: number;
  status: PaymentStatus;                  // "COMPLETE" | "HAS_BALANCE"
}
```

### `PaymentSummaryQuery` — query params for `GET /api/payments/summaries`

```typescript
interface PaymentSummaryQuery {
  page?: number;
  pageSize?: number;
  sortBy?: "full_name" | "outstanding_balance" | "college_name" | "periods_paid";
  sortOrder?: "asc" | "desc"; // default "asc"
  search?: string;             // searches full_name
  collegeId?: string;
  memberType?: MemberType;
  status?: PaymentStatus;
  hasMembershipFee?: boolean;  // true = only members who paid membership
  month?: number;              // 1–12 — only members who paid this month
  year?: number;               // filter by year_ref column
}
// Access: treasurer only
```

---

## Dashboard Models

### `TreasurerDashboard` — `GET /api/dashboard/treasurer`

```typescript
interface TreasurerDashboard {
  totalMembers: number;        // count of active members
  totalCollected: number;      // sum of (membership_fee_amount_paid + total_dues_paid) across all members
  membersWithBalance: number;  // count with status "HAS_BALANCE"
  membersComplete: number;     // count with status "COMPLETE"
  collectionByCollege: {
    collegeId: string;
    collegeName: string;
    total: number;             // total amount collected from this college
    memberCount: number;
  }[];
}
// Access: treasurer only
// Cached: auto-revalidates every 60 seconds server-side
```

### `MemberDashboard` — `GET /api/dashboard/member`

```typescript
interface MemberDashboard {
  memberId: string;
  fullName: string;
  college: string | null;         // college name string (NOT the ID)
  memberType: MemberType;
  membershipFeePaid: boolean;
  periodsExpected: number;        // total dues periods expected for their tenure
  periodsPaid: number;            // how many dues periods have been paid
  monthsPaid: number[];           // month numbers paid e.g. [1, 2, 3]
  outstandingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string | null; // ISO Date YYYY-MM-DD
}
// Access: any authenticated user (returns OWN record only — no memberId param)
// If member has no payment records yet, returns zeroed stats with status "HAS_BALANCE"
```

---

## Dues Configuration Models

### `DuesConfig` — `GET /api/dues-configurations`

```typescript
interface DuesConfig {
  id: string;                    // UUID
  paymentType: PaymentType;
  memberType: MemberType;
  amount: number;                // parsed float, e.g. 250.00
  effectiveFrom: string;         // ISO Date YYYY-MM-DD
  effectiveUntil: string | null; // null = currently active rate
  createdAt: string;             // ISO 8601
}
// Access: any authenticated user
// Default query: activeOnly=true (only current active rates)
// Query params: paymentType?, memberType?, activeOnly? (boolean, default true)
```

### `CreateDuesConfigInput` — `POST /api/dues-configurations` body

```typescript
interface CreateDuesConfigInput {
  paymentType: PaymentType;
  memberType: MemberType;
  amount: number;          // must be > 0
  effectiveFrom: string;   // ISO Date YYYY-MM-DD
}
// Response: 201 { success: true, data: DuesConfig }
// Error 409 if same paymentType+memberType already has a rate with this effectiveFrom
```

> **Business Rules:**  
> - `MEMBERSHIP_FEE` only applies to `FULL_TIME` members. `ASSOCIATE + MEMBERSHIP_FEE` → 400 error.  
> - Rates are append-only — creating a new rate automatically closes the previous active rate  
>   by setting its `effectiveUntil = effectiveFrom - 1 day`.

### `CurrentRates` — `GET /api/dues-configurations/current`

Flat map keyed as `{PAYMENT_TYPE}_{MEMBER_TYPE}`:

```typescript
interface CurrentRates {
  MEMBERSHIP_FEE_FULL_TIME?: { id: string; amount: number; effectiveFrom: string };
  MONTHLY_DUES_FULL_TIME?:   { id: string; amount: number; effectiveFrom: string };
  MONTHLY_DUES_ASSOCIATE?:   { id: string; amount: number; effectiveFrom: string };
}
// Access: any authenticated user
// Use this in the payment recording form to pre-fill the expected amount
// Keys may be absent if no rate has been configured for that combination yet
```

---

## Report Models

### `GenerateReportInput` — `POST /api/reports/generate` body

```typescript
interface GenerateReportInput {
  year: number;         // 2020–2099, required
  format: ReportFormat; // "json" | "excel" | "pdf"
  collegeId?: string;   // UUID — omit to include all colleges
}
// Access: treasurer only
```

### `ReportData` — response when `format = "json"`

```typescript
interface ReportData {
  generatedAt: string;    // ISO 8601 timestamp
  year: number;           // the year passed in the request
  college: string;        // college name or "All Colleges" if no collegeId filter
  totalMembers: number;
  totalCollected: number; // sum of all membership fees + dues paid
  members: ReportMemberRow[];
}

interface ReportMemberRow {
  memberId: string;
  fullName: string;
  collegeName: string;
  memberType: string;             // "FULL_TIME" | "ASSOCIATE"
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  outstandingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string | null; // ISO Date YYYY-MM-DD
}
```

> **For `excel` and `pdf` formats:** Response is a binary file download, not JSON.  
> Response headers: `Content-Type: application/pdf` (or xlsx), `Content-Disposition: attachment; filename="gfast-report-{year}-{scope}.{ext}"`.  
> In the browser: receive as `blob`, then trigger download via `URL.createObjectURL(blob)`.

---

## Complete Endpoint Summary

| Method | Path | Auth | Role | Response |
|---|---|---|---|---|
| `GET` | `/api/auth/me` | ✅ | any | `AuthMe` |
| `POST` | `/api/auth/signout` | ✅ | any | `{ message }` |
| `POST` | `/api/auth/invite` | ✅ | treasurer | `{ message }` (201) |
| `GET` | `/api/colleges` | ✅ | any | `College[]` |
| `GET` | `/api/academic-periods` | ✅ | any | `AcademicPeriod[]` |
| `GET` | `/api/members` | ✅ | treasurer | `Member[]` + meta |
| `POST` | `/api/members` | ✅ | treasurer | `Member` (201) |
| `GET` | `/api/members/:id` | ✅ | treasurer or own | `Member` |
| `PATCH` | `/api/members/:id` | ✅ | treasurer | `Member` |
| `PATCH` | `/api/members/:id/deactivate` | ✅ | treasurer | `{ message }` |
| `GET` | `/api/payments` | ✅ | treasurer | `PaymentRecord[]` + meta |
| `POST` | `/api/payments` | ✅ | treasurer | `PaymentRecord` (201) |
| `GET` | `/api/payments/summaries` | ✅ | treasurer | `PaymentSummaryRow[]` + meta |
| `GET` | `/api/payments/member/:memberId` | ✅ | treasurer or own | `PaymentRecord[]` + meta |
| `GET` | `/api/dashboard/treasurer` | ✅ | treasurer | `TreasurerDashboard` |
| `GET` | `/api/dashboard/member` | ✅ | member | `MemberDashboard` |
| `GET` | `/api/dues-configurations` | ✅ | any | `DuesConfig[]` |
| `POST` | `/api/dues-configurations` | ✅ | treasurer | `DuesConfig` (201) |
| `GET` | `/api/dues-configurations/current` | ✅ | any | `CurrentRates` |
| `POST` | `/api/reports/generate` | ✅ | treasurer | `ReportData` or binary |
