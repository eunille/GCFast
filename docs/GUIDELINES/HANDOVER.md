# GFAST-MPTS — Developer Handover Guide

> **GC Faculty Association System — Membership & Payment Tracking System**  
> Last updated: May 2026 · Branch: `main` · Deployed: https://gc-fast.vercel.app

---

## Table of Contents

1. [What the System Does](#1-what-the-system-does)
2. [Problems it Solves](#2-problems-it-solves)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [User Roles & Access Flow](#7-user-roles--access-flow)
8. [Feature Modules](#8-feature-modules)
9. [API Reference (Summary)](#9-api-reference-summary)
10. [Environment Setup](#10-environment-setup)
11. [Running Locally](#11-running-locally)
12. [Seeding the Database](#12-seeding-the-database)
13. [Deployment](#13-deployment)
14. [Known Patterns & Conventions](#14-known-patterns--conventions)
15. [What's Done / What's Next](#15-whats-done--whats-next)

---

## 1. What the System Does

GFAST-MPTS is a web portal for a faculty association that tracks:

- **Member registration** — full-time and associate faculty members per college
- **Dues collection** — monthly dues (₱60/month) and one-time membership fees (₱200, full-time only)
- **Payment recording** — treasurer records payments manually; supports single and bulk payment recording
- **Standing reports** — payment summaries, outstanding balances, collection rates per college
- **Member self-service** — members can log in and view their own dues status and payment history

---

## 2. Problems it Solves

| Before                                               | After                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| Manual spreadsheet tracking prone to errors          | Centralised DB with automatic status computation                   |
| No visibility into who has paid or owes dues         | Real-time dashboard with per-member and per-college breakdowns     |
| Treasurer had to share spreadsheet files for reports | Exportable reports (JSON preview, Excel, PDF) on demand            |
| Members had no way to check their own standing       | Members can self-serve via the member dashboard                    |
| No audit trail for who recorded a payment            | Every payment record stores `recorded_by` (treasurer's profile ID) |

---

## 3. Tech Stack

| Layer                 | Technology                                   | Version |
| --------------------- | -------------------------------------------- | ------- |
| Framework             | Next.js (App Router)                         | 16.2.4  |
| Language              | TypeScript                                   | 5.x     |
| Styling               | Tailwind CSS v4 + shadcn/ui                  | 4.x     |
| UI Components         | Radix UI primitives via shadcn               | —       |
| State / Data fetching | TanStack Query (React Query)                 | 5.x     |
| Tables                | TanStack Table                               | 8.x     |
| Charts                | Recharts                                     | 3.x     |
| Forms                 | Controlled React state + Zod validation      | —       |
| Backend               | Next.js API Routes (server-side Node.js)     | —       |
| Database              | Supabase (PostgreSQL)                        | —       |
| Auth                  | Supabase Auth (JWT)                          | —       |
| ORM / DB client       | Supabase JS client (`@supabase/supabase-js`) | 2.x     |
| Excel export          | ExcelJS                                      | 4.x     |
| PDF export            | PDFKit                                       | 0.18.x  |
| Toast notifications   | Sonner                                       | 2.x     |
| Hosting               | Vercel                                       | —       |
| Icons                 | Lucide React                                 | 1.x     |
| Validation            | Zod                                          | 4.x     |

---

## 4. Architecture Overview

The codebase follows a strict **4-layer architecture** applied to every feature:

```
Layer 1 — Types       → types/, models/         Pure TypeScript interfaces and enums
Layer 2 — Repository  → repositories/            API calls (authFetch → /api/*)
Layer 3 — Hook        → hooks/                   TanStack Query wrappers (useQuery / useMutation)
Layer 4 — Component   → components/, app/        React components and pages
```

**Data flow:**

```
Supabase DB
    ↓  (PostgREST / SQL)
Next.js API Route  (/app/api/*)
    ↓  (authFetch with Bearer token)
Repository  (features/*/repositories/)
    ↓  (TanStack Query)
Hook  (features/*/hooks/)
    ↓  (props / context)
Component / Page
```

**Key rules enforced:**

- Components never call Supabase directly — only via API routes
- API routes use `createSupabaseServer(req)` (server-side client with RLS bypass via service role)
- Client code uses `authFetch` which attaches `Authorization: Bearer <token>` automatically
- All API responses follow a standard `{ success, data, meta?, error? }` envelope

---

## 5. Project Structure

```
gcfast_frontend/
├── app/                        Next.js App Router pages + API routes
│   ├── (auth)/                 Public routes: login, register
│   ├── (treasurer)/            Treasurer-gated routes
│   │   └── treasurer/
│   │       ├── overview/       Dashboard page
│   │       ├── members/        Member management
│   │       ├── payments/       Payment management
│   │       ├── reports/        Report generation
│   │       └── dues/           Dues configuration
│   ├── (member)/               Member-gated routes
│   │   └── member/
│   │       └── dashboard/      Member self-service dashboard
│   └── api/                    Next.js API route handlers
│       ├── auth/
│       ├── members/
│       ├── payments/
│       ├── colleges/
│       ├── academic-periods/
│       ├── dues-configurations/
│       ├── dashboard/
│       └── reports/
│
├── components/
│   ├── layout/
│   │   └── AppShell/           Sidebar + top nav layout wrapper
│   ├── common/
│   │   ├── DataTable/          Generic table scaffold (unused; feature tables are custom)
│   │   ├── EmptyState/
│   │   ├── LoadingSkeleton/
│   │   └── StatusBadge/
│   └── ui/                     shadcn/ui components (button, card, dialog, etc.)
│
├── features/                   Feature slices (4-layer each)
│   ├── auth/
│   ├── members/
│   ├── payments/
│   ├── reports/
│   └── dues-configurations/
│
├── lib/
│   ├── hooks/                  Shared hooks (useColleges, useAcademicPeriods)
│   ├── middleware/             Route protection helpers (withAuth, withRole, withRateLimit)
│   ├── models/                 Shared TypeScript models (index.ts re-exports all)
│   ├── repositories/           Shared repositories (college, academic-period)
│   ├── services/               Server-side services (report-data, report-excel, report-pdf)
│   ├── supabase/               Supabase client factories (server + browser)
│   ├── types/                  Shared raw types
│   └── utils/                  Helpers: authFetch, cn, format, filter-schemas
│
├── scripts/
│   ├── seed.mjs                Database seeder (run with: npm run seed)
│   └── create-treasurer.mjs   Standalone script to create a treasurer account
│
├── supabase/
│   └── migrations/             SQL migration files (apply via Supabase dashboard or CLI)
│
├── theme/                      Design tokens (colors, spacing, typography, radius, shadows)
├── docs/                       API docs and implementation progress
│   ├── IMPLEMENTATION_PROGRESS.md
│   └── apidocs/
│       ├── API_REFERENCE.md
│       └── API_MODELS.md
├── next.config.ts              Security headers (CSP, CORS) + server external packages
├── .env.example                Environment variable reference (copy to .env)
└── HANDOVER.md                 ← this file
```

---

## 6. Database Schema

Managed via Supabase. Migrations live in `supabase/migrations/`.

### Tables

```
profiles              — Supabase Auth users (id mirrors auth.users.id)
  id, role, full_name, email, is_active

colleges              — Faculty colleges/departments
  id, name, code, is_active

academic_periods      — Month/year tracking periods (Jan–Dec per year)
  id, month, year, label, is_active

members               — Faculty members
  id, profile_id (nullable FK → profiles), college_id, employee_id,
  full_name, email, member_type (FULL_TIME|ASSOCIATE), joined_at,
  is_active, notes, created_by

dues_configurations   — Rate history (append-only, never deleted)
  id, payment_type (MEMBERSHIP_FEE|MONTHLY_DUES),
  member_type (FULL_TIME|ASSOCIATE), amount, effective_from, effective_until

payment_records       — All payment transactions
  id, member_id, payment_type, amount_paid, payment_date,
  academic_period_id (nullable), reference_number, notes, recorded_by
```

### Key DB View

```sql
member_payment_summary   — Aggregated per-member payment status
  (computed view, read-only, used by dashboard and summaries API)
  Fields: member_id, full_name, email, member_type, college_*,
          membership_fee_paid, periods_paid, periods_expected,
          months_paid[], outstanding_balance, status (COMPLETE|HAS_BALANCE)
```

### Enums

```sql
user_role     : treasurer | member
member_type   : FULL_TIME | ASSOCIATE
payment_type  : MEMBERSHIP_FEE | MONTHLY_DUES
payment_status: COMPLETE | HAS_BALANCE
```

### Current Rates (seed defaults)

| Type             | Member      | Amount             |
| ---------------- | ----------- | ------------------ |
| `MEMBERSHIP_FEE` | `FULL_TIME` | ₱200.00 (one-time) |
| `MONTHLY_DUES`   | `FULL_TIME` | ₱60.00/month       |
| `MONTHLY_DUES`   | `ASSOCIATE` | ₱60.00/month       |

> Associate members do **not** pay a membership fee.

---

## 7. User Roles & Access Flow

### Roles

| Role        | Login                                           | Access                                                                                |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `TREASURER` | treasurer account (created manually via script) | Full system access: manage members, record payments, generate reports, configure dues |
| `MEMBER`    | invite link from treasurer                      | Read-only: own dashboard, own payment history                                         |

### Authentication Flow

```
1. User visits /login
2. Enters email + password → Supabase Auth
3. JWT stored in cookie (httpOnly via @supabase/ssr)
4. Server reads role from user_metadata.role
5. Redirect:
     TREASURER → /treasurer/overview
     MEMBER    → /member/dashboard
6. All /api/* routes validate JWT and role on every request
   via withAuth() + withRole() middleware helpers
```

### Invite Flow (Member Account Creation)

```
1. Treasurer creates a member record (POST /api/members)
2. Treasurer clicks "Invite" on member detail page
3. POST /api/auth/invite → Supabase sends magic-link email
4. Member clicks link → sets password → account linked via profile_id FK
```

---

## 8. Feature Modules

### Auth (`features/auth/`)

- Login form with role-based redirect
- Register as member (self-registration links to existing member record)
- Sign-out hook
- `useRequireRole(role)` — redirects if wrong role, used in layout guards

### Members (`features/members/`)

- **Treasurer side**: paginated table with search/filter, create member modal, edit modal, quick-view modal, deactivate with confirmation, invite button
- **Member side**: profile card, balance summary, dues grid (12-month visual), payment history table

### Payments (`features/payments/`)

- **Treasurer side**: payment summaries table (per-member standing), 3-step record payment flow (select member → payment details → confirm), bulk payment support
- **Shared**: `PaymentStatusBadge` (COMPLETE = green, HAS_BALANCE = red), `PaymentHistoryTable`
- **Dashboard charts**: pie chart (collection by college), monthly trend bar chart, recent transactions table

### Reports (`features/reports/`)

- 5 report types: Payment Summary, Outstanding Balance, Membership Status, Monthly Collection, Member Standing
- JSON renders inline preview; Excel/PDF trigger file download
- Date range filter + college filter

### Dues Configuration (`features/dues-configurations/`)

- View active rates and full history
- Set new rate via modal (auto-closes previous rate)
- Business rules: ASSOCIATE cannot have MEMBERSHIP_FEE; effective date must not be in past

### Dashboard (Treasurer) (`features/payments/hooks/useTreasurerDashboard.ts`)

- 4 stat cards: Total Members, Total Collected, With Balance, Complete
- Payment distribution pie chart (per college)
- Monthly trend bar chart
- Recent transactions table

---

## 9. API Reference (Summary)

All routes require `Authorization: Bearer <access_token>` header.  
Full details: [`docs/apidocs/API_REFERENCE.md`](docs/apidocs/API_REFERENCE.md)  
Full models: [`docs/apidocs/API_MODELS.md`](docs/apidocs/API_MODELS.md)

| Method  | Path                               | Role            | Description                      |
| ------- | ---------------------------------- | --------------- | -------------------------------- |
| `GET`   | `/api/auth/me`                     | any             | Current user profile             |
| `POST`  | `/api/auth/signout`                | any             | Sign out                         |
| `POST`  | `/api/auth/invite`                 | treasurer       | Invite member via email          |
| `GET`   | `/api/colleges`                    | any             | All colleges                     |
| `GET`   | `/api/academic-periods`            | any             | All periods                      |
| `GET`   | `/api/members`                     | treasurer       | Paginated member list            |
| `POST`  | `/api/members`                     | treasurer       | Create member                    |
| `GET`   | `/api/members/:id`                 | treasurer / own | Get member                       |
| `PATCH` | `/api/members/:id`                 | treasurer       | Update member                    |
| `PATCH` | `/api/members/:id/deactivate`      | treasurer       | Soft-delete member               |
| `GET`   | `/api/payments`                    | treasurer       | Payment records                  |
| `POST`  | `/api/payments`                    | treasurer       | Record payment                   |
| `GET`   | `/api/payments/summaries`          | treasurer       | Per-member payment standing      |
| `GET`   | `/api/payments/member/:id`         | treasurer / own | Member payment history           |
| `GET`   | `/api/dashboard/treasurer`         | treasurer       | Aggregate stats                  |
| `GET`   | `/api/dashboard/member`            | member          | Own payment standing             |
| `GET`   | `/api/dues-configurations`         | any             | Dues rate history                |
| `POST`  | `/api/dues-configurations`         | treasurer       | Set new rate                     |
| `GET`   | `/api/dues-configurations/current` | any             | Active rates map                 |
| `POST`  | `/api/reports/generate`            | treasurer       | Generate report (JSON/Excel/PDF) |

---

## 10. Environment Setup

Copy `.env.example` to `.env` and fill in values:

```env
# Supabase (from: Supabase Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key     # SERVER ONLY — never expose to browser

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000            # your deployed URL in production

# CORS (optional — auto-detected from VERCEL_URL if not set)
ALLOWED_ORIGIN=http://localhost:3000
```

**Vercel environment variables** (set in Vercel dashboard → Settings → Environment Variables):

| Variable                        | Required                              |
| ------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅                                    |
| `NEXT_PUBLIC_APP_URL`           | Recommended                           |
| `ALLOWED_ORIGIN`                | Optional (falls back to `VERCEL_URL`) |

---

## 11. Running Locally

**Prerequisites:** Node.js ≥ 20, npm ≥ 10

```bash
# 1. Install dependencies
cd gcfast_frontend
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Apply DB migrations
# Go to: Supabase Dashboard → SQL Editor
# Run each file in supabase/migrations/ in order (001_, 002_, ...)
# OR via Supabase CLI:
supabase db reset --linked

# 4. Seed the database
npm run seed

# 5. Create a treasurer account (if seed doesn't work)
npm run create-treasurer

# 6. Start dev server
npm run dev
# App runs at http://localhost:3000
```

**Test accounts (after seeding):**

| Role      | Email                  | Password        |
| --------- | ---------------------- | --------------- |
| Treasurer | `treasurer@gcfast.edu` | `Treasurer@123` |
| Member    | `ashley@gcfast.edu`    | `Member@1234`   |

---

## 12. Seeding the Database

The seed script (`scripts/seed.mjs`) is idempotent (safe to re-run). It creates:

- 1 treasurer auth account + 1 member auth account
- **5 colleges**: CAHS, CBA, CCS, CEAS, CHTM
- 12 academic periods (Jan–Dec of current year)
- 3 dues configurations (current rates)
- **50 members** (10 per college, mix of FULL_TIME and ASSOCIATE)
- ~200+ payment records covering 8 scenarios:
  - `COMPLETE` — fee + all months paid
  - `PARTIAL` — fee paid, months 1–4 only
  - `FEE_ONLY` — membership fee only, no dues
  - `NO_PAYMENT` — no payments at all
  - `ASSOCIATE_ALL` — all months paid
  - `ASSOCIATE_PART` — first 3 months paid
  - `ASSOCIATE_NONE` — no payments
  - `FT_NO_FEE_PARTIAL` — no fee, 3 months paid

```bash
npm run seed
```

---

## 13. Deployment

The app is deployed on **Vercel** at https://gc-fast.vercel.app.

**Trigger a deployment:**

- Push to `main` branch → Vercel auto-deploys
- Or: Vercel Dashboard → Deployments → Redeploy

**Build command:** `npm run build`  
**Output directory:** `.next` (auto-detected by Vercel)  
**Node version:** ≥ 20 (enforced in `package.json` engines)

The app uses:

- `serverExternalPackages: ["pdfkit", "exceljs"]` — these use Node.js fs/stream and must not be bundled
- Sticky header layout (header `position: sticky`, sidebar `position: fixed`)
- CSP headers configured in `next.config.ts` (allows `unsafe-inline` for Next.js script injection)

---

## 14. Known Patterns & Conventions

### `authFetch`

All client-side API calls go through `lib/utils/auth-fetch.ts`. It automatically attaches the Supabase session JWT:

```ts
import { authFetch } from "@/lib/utils/auth-fetch";
const data = await authFetch("/api/members");
```

### API Middleware Chain

Every API route handler wraps with:

```ts
export const GET = withAuth(withRole("TREASURER", withRateLimit(handler)));
```

### Tailwind v4 Syntax

This project uses **Tailwind CSS v4**. Key differences from v3:

- Gradients: `bg-linear-to-br` (not `bg-gradient-to-br`)
- Custom tokens defined in `app/globals.css` via `@theme inline { ... }`
- No `tailwind.config.js` — configuration is in CSS

### `cn` utility

```ts
import { cn } from "@/lib/utils/cn";
// Combines clsx + tailwind-merge
```

### Toast notifications

Always use `sonner` (not any other toast library):

```ts
import { toast } from "sonner";
toast.success("Saved");
toast.error("Failed", { description: err.message });
```

### Supabase clients

- **Server-side** (in `/app/api/`): `createSupabaseServer(req)` from `lib/supabase/server.ts`
- **Client-side** (hooks/components): `createSupabaseBrowser()` from `lib/supabase/browser.ts`
- **Admin** (bypasses RLS): uses `SUPABASE_SERVICE_ROLE_KEY` — server only

### `"use client"` directive

Must be the **first line** of any file using React hooks, browser APIs, or event handlers.

### `export const dynamic = "force-dynamic"`

Add to any page that fetches data at request time (prevents static pre-rendering):

```ts
export const dynamic = "force-dynamic";
```

---

## 15. What's Done / What's Next

### Completed ✅

| Feature                                               | Status |
| ----------------------------------------------------- | ------ |
| Authentication (login, logout, role redirect)         | ✅     |
| App shell (sidebar, sticky header, responsive)        | ✅     |
| Reference data (colleges, academic periods)           | ✅     |
| Treasurer dashboard (stats, charts, tables)           | ✅     |
| Member management (CRUD, filters, pagination, invite) | ✅     |
| Payment recording (single + bulk 3-step flow)         | ✅     |
| Payment summaries table (per-member standing)         | ✅     |
| Payment history (per member)                          | ✅     |
| Report generation (JSON preview, Excel, PDF download) | ✅     |
| Member self-service dashboard                         | ✅     |
| Dues configuration management                         | ✅     |
| Database seeding script                               | ✅     |
| Vercel deployment                                     | ✅     |

### Potential Next Steps ⬜

| Feature                                     | Notes                                                |
| ------------------------------------------- | ---------------------------------------------------- |
| Email notifications on payment recorded     | Supabase Edge Functions or Resend API                |
| Member profile editing (self-service)       | Page stub exists at `/member/profile`                |
| Member self-service reports                 | Page stub exists at `/member/reports`                |
| Bulk member import (CSV upload)             | No API or UI built yet                               |
| Academic period management UI               | Currently requires DB or seed script                 |
| Pagination on payment history (member side) | Currently shows all records                          |
| Dark mode                                   | `next-themes` is installed but not wired             |
| Unit / integration tests                    | No test setup yet                                    |
| Admin role                                  | Schema has `user_role` enum with admin but not used  |
| Audit log / activity feed                   | `recorded_by` exists on payments but no UI           |
| Treasurer invitation flow                   | Currently treasurer accounts created via script only |

---

## Contacts / Repo

- **GitHub:** https://github.com/eunille/GCFast
- **Live app:** https://gc-fast.vercel.app
- **Supabase project:** `zobacihyapqdldlnzsnr` (see Supabase dashboard for credentials)
- **Branch strategy:** feature branches → PR → merge to `main` → auto-deploy to Vercel
