# GFAST-MPTS Frontend — Implementation Progress

> This document tracks the implementation status of each phase.  
> Update it as each phase is completed.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🚧 | In progress |
| ⬜ | Not started |

---

## Phase 1 — Authentication ✅

**Goal:** Users can log in, be redirected by role, and log out securely.

| Item | File | Status |
|------|------|--------|
| `useSignIn` hook | `features/auth/hooks/useSignIn.ts` | ✅ |
| `LoginForm` component | `features/auth/components/LoginForm/LoginForm.tsx` | ✅ |
| Login page | `app/(auth)/login/page.tsx` | ✅ |
| Unauthorized page | `app/unauthorized/page.tsx` | ✅ |
| Root redirect (`/` → `/login`) | `app/page.tsx` | ✅ (pre-existing) |
| Auth layout | `app/(auth)/layout.tsx` | ✅ (pre-existing) |

**Pre-existing (Layer 1–3 already implemented):**
- `features/auth/types/auth.types.ts` — `AuthUser`, `UserRole`
- `features/auth/repositories/auth.repository.ts` — `signIn`, `signOut`, `getSession`
- `features/auth/hooks/useAuth.ts` — session state
- `features/auth/hooks/useSignOut.ts` — sign-out + redirect
- `features/auth/hooks/useRequireRole.ts` — RBAC redirect guard

**Notes:**
- `useSignIn` maps raw Supabase error strings to user-friendly messages
- Login page redirects: `TREASURER` / `ADMIN` → `/treasurer/overview`, `MEMBER` → `/member/dashboard`
- All colors, spacing, radius, and shadows sourced from `@/theme`
- ShadCN components used: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Button`

---

## Phase 2 — App Shell & Navigation ⬜

**Goal:** Both roles have a working shell layout with sidebar navigation and a sign-out button.

| Item | File | Status |
|------|------|--------|
| `AppShell` component | `components/layout/AppShell/AppShell.tsx` | ⬜ |
| `Sidebar` component | `components/layout/AppShell/Sidebar.tsx` | ⬜ |
| `TopNav` component | `components/layout/AppShell/TopNav.tsx` | ⬜ |
| Treasurer layout (wire up shell) | `app/(treasurer)/layout.tsx` | ⬜ |
| Member layout (wire up shell) | `app/(member)/layout.tsx` | ⬜ |

---

## Phase 3 — Reference Data Layer ⬜

**Goal:** Shared data needed by multiple features loaded once and cached.

| Item | File | Status |
|------|------|--------|
| `useColleges` hook | `lib/hooks/useColleges.ts` | ✅ (pre-existing) |
| `useAcademicPeriods` hook | `lib/hooks/useAcademicPeriods.ts` | ⬜ |
| `useCurrentRates` hook | `features/dues-configurations/hooks/useCurrentRates.ts` | ⬜ |

---

## Phase 4 — Treasurer Dashboard Overview ⬜

**Goal:** Treasurer can see aggregate collection stats at a glance.

| Item | File | Status |
|------|------|--------|
| `useTreasurerDashboard` hook | `features/payments/hooks/useTreasurerDashboard.ts` | ⬜ |
| `DashboardStatsCard` component | `features/payments/components/DashboardStatsCard/` | ⬜ |
| `CollectionProgressBar` component | `features/payments/components/CollectionProgressBar/` | ⬜ |
| Overview page | `app/(treasurer)/overview/page.tsx` | ⬜ |

---

## Phase 5 — Member Management (Treasurer) ⬜

**Goal:** Treasurer can view, create, edit, and deactivate members.

| Item | File | Status |
|------|------|--------|
| `MemberList` component | `features/members/components/MemberList/` | ⬜ |
| `MemberListFilter` component | `features/members/components/MemberList/MemberListFilter.tsx` | ⬜ |
| `CreateMemberModal` component | `features/members/components/CreateMemberModal/` | ⬜ |
| `EditMemberModal` component | `features/members/components/EditMemberModal/` | ⬜ |
| Members page | `app/(treasurer)/members/page.tsx` | ⬜ |
| Member detail page | `app/(treasurer)/members/[id]/page.tsx` | ⬜ |

---

## Phase 6 — Payment Management (Treasurer) ⬜

**Goal:** Treasurer can view and record payment transactions.

| Item | File | Status |
|------|------|--------|
| `PaymentTable` component | `features/payments/components/PaymentTable/` | ⬜ |
| `RecordPaymentModal` component | `features/payments/components/RecordPaymentModal/` | ⬜ |
| `PaymentStatusBadge` component | `features/payments/components/PaymentStatusBadge/` | ⬜ |
| Payments page | `app/(treasurer)/payments/page.tsx` | ⬜ |

---

## Phase 7 — Reports (Treasurer) ⬜

**Goal:** Treasurer can generate and export payment reports.

| Item | File | Status |
|------|------|--------|
| `ReportFilters` component | `features/reports/components/ReportFilters/` | ⬜ |
| `ReportPreview` component | `features/reports/components/ReportPreview/` | ⬜ |
| Reports page | `app/(treasurer)/reports/page.tsx` | ⬜ |

---

## Phase 8 — Member Dashboard ⬜

**Goal:** Member can view their own dues status and payment history.

| Item | File | Status |
|------|------|--------|
| `MemberDashboard` component | `features/members/components/MemberDashboard/` | ⬜ |
| `MemberCard` component | `features/members/components/MemberCard/` | ⬜ |
| `StandingBadge` component | `features/members/components/StandingBadge/` | ⬜ |
| `PaymentHistoryTable` component | `features/payments/components/PaymentHistoryTable/` | ⬜ |
| Member dashboard page | `app/(member)/dashboard/page.tsx` | ⬜ |
