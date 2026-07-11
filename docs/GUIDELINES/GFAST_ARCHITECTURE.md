# GFAST-MPTS Frontend Architecture

**4-Layer Architecture — GFAST Teacher Membership Payment Tracking System**

> Based on the 4-Layer Architecture pattern. Adapted for Next.js 14 App Router + shadcn/ui + Supabase.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Rules](#core-rules)
3. [The Four Layers](#the-four-layers)
4. [Theme System](#theme-system)
5. [Folder Structure](#folder-structure)
6. [Layer Responsibilities](#layer-responsibilities)
7. [Data Flow](#data-flow)
8. [Import & Dependency Rules](#import--dependency-rules)
9. [Component Size Rule](#component-size-rule)
10. [GFAST Domain Examples](#gfast-domain-examples)
11. [Common Pitfalls](#common-pitfalls)

---

## Overview

### What & Why

The GFAST-MPTS frontend is divided into **4 strict layers**, each with one job. This ensures:

- Any developer can open any file and immediately know what it does and where it belongs
- UI changes never break business logic
- Supabase can be swapped without touching a single component
- Easy handoff — structure is self-documenting

### Separation of Concerns

```
┌──────────────────────┬────────────────────────────────────────────┐
│ Layer                │ Concern                                     │
├──────────────────────┼────────────────────────────────────────────┤
│ 4 — Presentational   │ How things LOOK (UI components, pages)     │
│ 3 — Application      │ How things WORK (hooks, state, logic)      │
│ 2 — Data             │ How things CONNECT (Supabase, API calls)   │
│ 1 — Domain           │ What things ARE (types, rules, constants)  │
└──────────────────────┴────────────────────────────────────────────┘
```

---

## Core Rules

These are non-negotiable across the entire codebase:

1. **No component exceeds 500 lines** — split it into smaller pieces
2. **No business logic in UI components** — it belongs in hooks (Layer 3)
3. **No Supabase calls in components or hooks** — only in repositories (Layer 2)
4. **No React imports in domain layer** — pure TypeScript only
5. **All colors, spacing, and fonts come from `/theme`** — never hardcode values
6. **Layers only import downward** — Layer 4 → 3 → 2 → 1, never upward

---

## The Four Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 4: PRESENTATIONAL                        │
│              Pages, UI Components, Layouts                       │
│                                                                  │
│  Lives in:   app/ (pages)  +  features/*/components/            │
│              components/ui/  +  components/layout/              │
│  Rules:      NO business logic. NO Supabase. Just render.       │
└─────────────────────────────────────────────────────────────────┘
                            ↓  uses hooks from
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 3: APPLICATION                          │
│            Hooks, State Management, Business Logic               │
│                                                                  │
│  Lives in:   features/*/hooks/  +  lib/hooks/                   │
│  Rules:      NO direct Supabase calls. NO JSX. Logic only.      │
└─────────────────────────────────────────────────────────────────┘
                            ↓  calls repositories from
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 2: DATA                              │
│               Repositories, Mappers, API Calls                   │
│                                                                  │
│  Lives in:   features/*/repositories/  +  lib/supabase/          │
│  Rules:      ONLY layer that touches Supabase. No JSX. No hooks.│
└─────────────────────────────────────────────────────────────────┘
                            ↓  uses types from
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 1: DOMAIN                            │
│           Types, Interfaces, Schemas, Constants                  │
│                                                                  │
│  Lives in:   features/*/types/  +  lib/types/                   │
│  Rules:      Pure TypeScript only. Zero framework dependencies.  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Theme System

All visual tokens live in `/theme`. **Never hardcode a color, font size, or spacing value anywhere else.**

```
theme/
├── colors.ts          # Color palette and semantic color tokens
├── typography.ts      # Font sizes, weights, line heights
├── spacing.ts         # Spacing scale
├── radius.ts          # Border radius tokens
├── shadows.ts         # Box shadow tokens
└── index.ts           # Re-exports everything
```

### colors.ts — example

```typescript
// theme/colors.ts

export const palette = {
  blue: {
    900: "#1E3A5F",   // Dark navy — primary brand
    600: "#2E86C1",   // Accent blue — buttons, links
    100: "#D6E4F0",   // Light blue — backgrounds, table headers
  },
  gray: {
    700: "#7F8C8D",   // Muted text, captions
    100: "#F2F3F4",   // Table row stripe, backgrounds
  },
  green: {
    500: "#27AE60",   // All Dues Paid badge
    100: "#D5F5E3",   // All Dues Paid badge background
  },
  red: {
    500: "#E74C3C",   // Has Outstanding Balance badge
    100: "#FADBD8",   // Has Outstanding Balance badge background
  },
  white: "#FFFFFF",
  text: {
    primary:   "#2C3E50",
    secondary: "#7F8C8D",
  },
} as const;

// Semantic tokens — use these in components, not raw palette
export const colors = {
  brand: {
    primary:   palette.blue[900],
    accent:    palette.blue[600],
    subtle:    palette.blue[100],
  },
  status: {
    paid:        palette.green[500],
    paidBg:      palette.green[100],
    outstanding: palette.red[500],
    outstandingBg: palette.red[100],
  },
  surface: {
    page:   palette.white,
    stripe: palette.gray[100],
    header: palette.blue[900],
  },
  text: palette.text,
} as const;
```

### typography.ts — example

```typescript
// theme/typography.ts

export const typography = {
  fontFamily: {
    sans: "Inter, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  fontSize: {
    xs:   "0.75rem",   // 12px — captions, labels
    sm:   "0.875rem",  // 14px — table cells, secondary
    base: "1rem",      // 16px — body text
    lg:   "1.125rem",  // 18px — card titles
    xl:   "1.25rem",   // 20px — section headings
    "2xl":"1.5rem",    // 24px — page headings
    "3xl":"1.875rem",  // 30px — dashboard hero numbers
  },
  fontWeight: {
    normal:   "400",
    medium:   "500",
    semibold: "600",
    bold:     "700",
  },
} as const;
```

### Usage in components

```typescript
// ✅ Correct — import from theme
import { colors } from "@/theme";

<Badge style={{ background: colors.status.paidBg, color: colors.status.paid }}>
  All Dues Paid
</Badge>

// ❌ Wrong — hardcoded value
<Badge style={{ background: "#D5F5E3", color: "#27AE60" }}>
  All Dues Paid
</Badge>
```

---

## Folder Structure

```
apps/web/
│
├── app/                              # Layer 4 — Next.js routing
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── (treasurer)/
│   │   ├── layout.tsx                # Treasurer shell layout
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── members/
│   │   │   ├── page.tsx              # Member list + filter
│   │   │   └── [id]/page.tsx         # Individual member detail
│   │   ├── payments/
│   │   │   └── page.tsx
│   │   └── reports/
│   │       └── page.tsx
│   └── (member)/
│       ├── layout.tsx                # Member shell layout
│       └── dashboard/
│           └── page.tsx
│
├── features/                         # Domain feature modules
│   │
│   ├── payments/                     # Payment feature
│   │   ├── types/                    # Layer 1 — Domain
│   │   │   ├── payment.types.ts
│   │   │   └── payment.schemas.ts
│   │   ├── repositories/             # Layer 2 — Data
│   │   │   ├── payment.repository.ts
│   │   │   └── payment.mapper.ts
│   │   ├── hooks/                    # Layer 3 — Application
│   │   │   ├── usePayments.ts
│   │   │   ├── useRecordPayment.ts
│   │   │   └── usePaymentStatus.ts
│   │   └── components/               # Layer 4 — Presentational
│   │       ├── PaymentTable/
│   │       │   ├── PaymentTable.tsx       # < 500 lines
│   │       │   ├── PaymentTableRow.tsx    # split out
│   │       │   ├── PaymentTableHeader.tsx # split out
│   │       │   └── index.ts
│   │       ├── RecordPaymentModal/
│   │       │   ├── RecordPaymentModal.tsx
│   │       │   ├── RecordPaymentForm.tsx  # split out
│   │       │   └── index.ts
│   │       └── PaymentStatusBadge/
│   │           ├── PaymentStatusBadge.tsx
│   │           └── index.ts
│   │
│   ├── members/                      # Member feature
│   │   ├── types/
│   │   │   ├── member.types.ts
│   │   │   └── member.schemas.ts
│   │   ├── repositories/
│   │   │   ├── member.repository.ts
│   │   │   └── member.mapper.ts
│   │   ├── hooks/
│   │   │   ├── useMembers.ts
│   │   │   ├── useMember.ts
│   │   │   └── useMemberStanding.ts
│   │   └── components/
│   │       ├── MemberList/
│   │       │   ├── MemberList.tsx
│   │       │   ├── MemberListItem.tsx
│   │       │   ├── MemberListFilter.tsx
│   │       │   └── index.ts
│   │       ├── MemberCard/
│   │       │   ├── MemberCard.tsx
│   │       │   └── index.ts
│   │       └── StandingBadge/
│   │           ├── StandingBadge.tsx
│   │           └── index.ts
│   │
│   ├── reports/                      # Reports feature
│   │   ├── types/
│   │   ├── repositories/
│   │   ├── hooks/
│   │   │   └── useGenerateReport.ts
│   │   └── components/
│   │       ├── ReportFilters/
│   │       └── ReportPreview/
│   │
│   └── auth/                         # Auth feature
│       ├── types/
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useRequireRole.ts
│       └── components/
│           └── LoginForm/
│
├── components/                        # Shared UI (Layer 4)
│   ├── ui/                            # shadcn base components
│   │   ├── button.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/                        # Shared layout pieces
│   │   ├── AppShell/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx            # split out
│   │   │   ├── TopNav.tsx             # split out
│   │   │   └── index.ts
│   │   └── PageHeader/
│   │       ├── PageHeader.tsx
│   │       └── index.ts
│   └── common/                        # Reusable non-feature components
│       ├── DataTable/
│       ├── StatusBadge/
│       ├── EmptyState/
│       └── LoadingSkeleton/
│
├── theme/                             # ← Global visual tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   └── index.ts
│
└── lib/                               # Infrastructure (Layers 1–2)
    ├── supabase/
    │   ├── client.ts                  # Supabase browser client
    │   └── server.ts                  # Supabase server client (SSR)
    ├── types/
    │   └── shared.types.ts            # Shared global types
    ├── hooks/
    │   └── useToast.ts                # Global utility hooks
    └── utils/
        ├── format.ts                  # Date, currency formatters
        └── cn.ts                      # Tailwind class merge utility
```

---

## Layer Responsibilities

### Layer 1 — Domain (`features/*/types/`)

**Pure TypeScript. Zero framework dependencies. Zero side effects.**

```typescript
// features/payments/types/payment.types.ts

export type PaymentType = "MEMBERSHIP_FEE" | "MONTHLY_DUES";

export type PaymentStatus = "COMPLETE" | "HAS_BALANCE";

export interface Payment {
  id: string;
  memberId: string;
  paymentType: PaymentType;
  amountPaid: number;
  paymentDate: Date;
  monthRef: number | null;   // 1–12, only for MONTHLY_DUES
  yearRef: number | null;
  recordedBy: string;
}

export interface MemberPaymentSummary {
  memberId: string;
  memberName: string;
  college: string;
  membershipFeePaid: boolean;
  monthsPaid: number[];          // e.g. [1, 2, 3] = Jan, Feb, Mar paid
  outstandingBalance: number;
  status: PaymentStatus;
}

// Pure business rule — no React, no Supabase
export function computePaymentStatus(
  summary: Pick<MemberPaymentSummary, "membershipFeePaid" | "outstandingBalance">
): PaymentStatus {
  return summary.membershipFeePaid && summary.outstandingBalance === 0
    ? "COMPLETE"
    : "HAS_BALANCE";
}
```

```typescript
// features/payments/types/payment.schemas.ts
import { z } from "zod";

export const recordPaymentSchema = z.object({
  memberId:    z.string().uuid(),
  paymentType: z.enum(["MEMBERSHIP_FEE", "MONTHLY_DUES"]),
  amountPaid:  z.number().positive("Amount must be greater than 0"),
  paymentDate: z.date(),
  monthRef:    z.number().min(1).max(12).nullable(),
  yearRef:     z.number().min(2020).nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
```

---

### Layer 2 — Data (`features/*/repositories/`)

**Only layer that calls Supabase. No JSX. No React hooks.**

```typescript
// features/payments/repositories/payment.repository.ts
import { supabase } from "@/lib/supabase/client";
import { mapPaymentFromDb, mapPaymentSummaryFromDb } from "./payment.mapper";
import type { RecordPaymentInput, Payment, MemberPaymentSummary } from "../types/payment.types";

export const paymentRepository = {

  async getAllSummaries(collegeId?: string): Promise<MemberPaymentSummary[]> {
    let query = supabase
      .from("member_payment_summary")   // a Supabase view
      .select("*");

    if (collegeId) query = query.eq("college_id", collegeId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(mapPaymentSummaryFromDb);
  },

  async getByMember(memberId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payment_records")
      .select("*")
      .eq("member_id", memberId)
      .order("payment_date", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapPaymentFromDb);
  },

  async record(input: RecordPaymentInput): Promise<Payment> {
    const { data, error } = await supabase
      .from("payment_records")
      .insert({
        member_id:    input.memberId,
        payment_type: input.paymentType,
        amount_paid:  input.amountPaid,
        payment_date: input.paymentDate.toISOString(),
        month_ref:    input.monthRef,
        year_ref:     input.yearRef,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPaymentFromDb(data);
  },
};
```

```typescript
// features/payments/repositories/payment.mapper.ts

// Maps raw Supabase snake_case rows → clean camelCase domain types
export function mapPaymentFromDb(row: any): Payment {
  return {
    id:          row.id,
    memberId:    row.member_id,
    paymentType: row.payment_type,
    amountPaid:  row.amount_paid,
    paymentDate: new Date(row.payment_date),
    monthRef:    row.month_ref,
    yearRef:     row.year_ref,
    recordedBy:  row.recorded_by,
  };
}

export function mapPaymentSummaryFromDb(row: any): MemberPaymentSummary {
  return {
    memberId:          row.member_id,
    memberName:        row.full_name,
    college:           row.college_name,
    membershipFeePaid: row.membership_fee_paid,
    monthsPaid:        row.months_paid ?? [],
    outstandingBalance:row.outstanding_balance,
    status:            computePaymentStatus({
      membershipFeePaid:  row.membership_fee_paid,
      outstandingBalance: row.outstanding_balance,
    }),
  };
}
```

---

### Layer 3 — Application (`features/*/hooks/`)

**Hooks only. Business orchestration. No JSX. No direct Supabase calls.**

```typescript
// features/payments/hooks/usePayments.ts
import { useQuery } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import type { MemberPaymentSummary } from "../types/payment.types";

export function usePayments(collegeId?: string) {
  return useQuery<MemberPaymentSummary[]>({
    queryKey: ["payments", "summaries", collegeId],
    queryFn:  () => paymentRepository.getAllSummaries(collegeId),
  });
}
```

```typescript
// features/payments/hooks/useRecordPayment.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentRepository } from "../repositories/payment.repository";
import { recordPaymentSchema, type RecordPaymentInput } from "../types/payment.schemas";

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordPaymentInput) => {
      // Validate before hitting the repository
      const parsed = recordPaymentSchema.parse(input);
      return paymentRepository.record(parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
```

```typescript
// features/payments/hooks/usePaymentStatus.ts
import { computePaymentStatus } from "../types/payment.types";
import type { MemberPaymentSummary } from "../types/payment.types";

// Pure derivation hook — no async, no side effects
export function usePaymentStatus(summary: MemberPaymentSummary) {
  const status = computePaymentStatus(summary);

  return {
    isComplete:    status === "COMPLETE",
    hasBalance:    status === "HAS_BALANCE",
    statusLabel:   status === "COMPLETE" ? "All Dues Paid" : "Has Outstanding Balance",
  };
}
```

---

### Layer 4 — Presentational (`features/*/components/`)

**UI only. Uses hooks. Never imports repositories directly.**

#### Splitting Rule in practice

Instead of one 600-line `PaymentTable.tsx`, split like this:

```typescript
// features/payments/components/PaymentTable/PaymentTableHeader.tsx
// Responsibility: renders the <thead> row only

import { colors } from "@/theme";

const COLUMNS = ["Member", "College", "Membership Fee", "Jan", "Feb", "Mar",
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Balance", "Status"];

export function PaymentTableHeader() {
  return (
    <thead style={{ background: colors.surface.header }}>
      <tr>
        {COLUMNS.map((col) => (
          <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-white">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}
```

```typescript
// features/payments/components/PaymentTable/PaymentTableRow.tsx
// Responsibility: renders a single member row

import { PaymentStatusBadge } from "../PaymentStatusBadge";
import type { MemberPaymentSummary } from "../../types/payment.types";

const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

interface Props {
  summary: MemberPaymentSummary;
}

export function PaymentTableRow({ summary }: Props) {
  return (
    <tr>
      <td>{summary.memberName}</td>
      <td>{summary.college}</td>
      <td>{summary.membershipFeePaid ? "✓" : "—"}</td>
      {MONTHS.map((m) => (
        <td key={m}>{summary.monthsPaid.includes(m) ? "✓" : "—"}</td>
      ))}
      <td>₱{summary.outstandingBalance.toFixed(2)}</td>
      <td><PaymentStatusBadge status={summary.status} /></td>
    </tr>
  );
}
```

```typescript
// features/payments/components/PaymentTable/PaymentTable.tsx
// Responsibility: orchestrates table rendering + filter

import { usePayments } from "../../hooks/usePayments";
import { PaymentTableHeader } from "./PaymentTableHeader";
import { PaymentTableRow } from "./PaymentTableRow";
import { CollegeFilter } from "./CollegeFilter";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useState } from "react";

export function PaymentTable() {
  const [collegeId, setCollegeId] = useState<string | undefined>();
  const { data, isLoading } = usePayments(collegeId);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      <CollegeFilter value={collegeId} onChange={setCollegeId} />
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <PaymentTableHeader />
          <tbody>
            {data?.map((summary) => (
              <PaymentTableRow key={summary.memberId} summary={summary} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Data Flow

```
User clicks "Record Payment"
        ↓
RecordPaymentModal (Layer 4)
  — renders the form, calls the hook on submit
        ↓
useRecordPayment() (Layer 3)
  — validates input with Zod schema
  — calls paymentRepository.record()
        ↓
paymentRepository.record() (Layer 2)
  — calls Supabase insert
  — maps result via mapPaymentFromDb()
        ↓
payment_records table (Supabase)
        ↑
useRecordPayment onSuccess
  — invalidates ["payments"] query
        ↑
usePayments() refetches
        ↑
PaymentTable re-renders with fresh data
```

---

## Import & Dependency Rules

```
✅ ALLOWED
Layer 4 (components) → Layer 3 (hooks)
Layer 4 (components) → Layer 1 (types)
Layer 4 (components) → theme/
Layer 3 (hooks)      → Layer 2 (repositories)
Layer 3 (hooks)      → Layer 1 (types)
Layer 2 (repos)      → Layer 1 (types)
Layer 2 (repos)      → lib/supabase/

❌ NEVER ALLOWED
Layer 1 (types)      → anything (it's the foundation)
Layer 2 (repos)      → Layer 3 or 4
Layer 3 (hooks)      → Layer 4 (components)
Any layer            → hardcoded colors / spacing (use theme/)
Components           → lib/supabase/ directly
```

---

## Component Size Rule

**Hard limit: 500 lines per file.** When a component grows beyond that, split it.

### How to split

| Too big | Split into |
|---|---|
| `PaymentTable.tsx` (600 lines) | `PaymentTable.tsx` + `PaymentTableRow.tsx` + `PaymentTableHeader.tsx` + `CollegeFilter.tsx` |
| `RecordPaymentModal.tsx` (550 lines) | `RecordPaymentModal.tsx` + `RecordPaymentForm.tsx` + `PaymentTypeSelect.tsx` |
| `MemberDashboard.tsx` (700 lines) | `MemberDashboard.tsx` + `DuesGrid.tsx` + `BalanceSummaryCard.tsx` + `StandingBanner.tsx` |

### Each split file gets its own folder

```
PaymentTable/
├── PaymentTable.tsx         ← orchestrator, < 100 lines
├── PaymentTableHeader.tsx   ← thead only
├── PaymentTableRow.tsx      ← single row
├── CollegeFilter.tsx        ← dropdown filter
└── index.ts                 ← re-exports PaymentTable
```

The `index.ts` re-export means imports outside the folder stay clean:

```typescript
// ✅ Clean — folder acts as a module
import { PaymentTable } from "@/features/payments/components/PaymentTable";

// ❌ Messy — exposes internals
import { PaymentTable } from "@/features/payments/components/PaymentTable/PaymentTable";
```

---

## GFAST Domain Examples

### Types at a glance

| Domain Concept | Type | Lives in |
|---|---|---|
| Faculty member | `Member` | `features/members/types/member.types.ts` |
| College/Department | `College` | `lib/types/shared.types.ts` |
| Payment transaction | `Payment` | `features/payments/types/payment.types.ts` |
| Payment type enum | `PaymentType` | `features/payments/types/payment.types.ts` |
| Member payment summary | `MemberPaymentSummary` | `features/payments/types/payment.types.ts` |
| Status indicator | `PaymentStatus` | `features/payments/types/payment.types.ts` |
| Auth user + role | `AuthUser` | `features/auth/types/auth.types.ts` |
| Report filters | `ReportFilter` | `features/reports/types/report.types.ts` |

### Status Indicator — how it flows

The "All Dues Paid" vs "Has Outstanding Balance" badge follows the full data flow:

```
Domain:  computePaymentStatus() in payment.types.ts
           ↓ pure function, no side effects
Data:    mapPaymentSummaryFromDb() calls it during mapping
           ↓ status is part of MemberPaymentSummary
Application: usePaymentStatus() derives label & booleans
           ↓
Presentational: <PaymentStatusBadge status={...} /> renders the badge
                colors come from theme/colors.ts (status tokens)
```

---

## Common Pitfalls

### ❌ Pitfall 1: Supabase call inside a component

```typescript
// ❌ Wrong — Layer 4 calling Supabase directly
export function MemberList() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    supabase.from("members").select("*").then(({ data }) => setMembers(data));
  }, []);
}

// ✅ Correct — use a hook
export function MemberList() {
  const { data: members } = useMembers();
}
```

### ❌ Pitfall 2: Business logic inside a component

```typescript
// ❌ Wrong — status derived in UI
export function PaymentTableRow({ summary }) {
  const isComplete = summary.membershipFeePaid && summary.outstandingBalance === 0;
  const label = isComplete ? "All Dues Paid" : "Has Outstanding Balance";
}

// ✅ Correct — logic in hook, domain function, or mapper
export function PaymentTableRow({ summary }) {
  const { statusLabel } = usePaymentStatus(summary);
}
```

### ❌ Pitfall 3: Hardcoded colors in components

```typescript
// ❌ Wrong — future rebrand breaks 40 files
<Badge className="bg-green-100 text-green-600">All Dues Paid</Badge>

// ✅ Correct — one change in theme/colors.ts updates everything
import { colors } from "@/theme";
<Badge style={{ background: colors.status.paidBg, color: colors.status.paid }}>
  All Dues Paid
</Badge>
```

### ❌ Pitfall 4: One giant component file

```typescript
// ❌ Wrong — 700-line MemberDashboard.tsx doing everything

// ✅ Correct — each piece is its own file
MemberDashboard/
├── MemberDashboard.tsx      ← layout only, ~80 lines
├── StandingBanner.tsx       ← status indicator banner
├── BalanceSummaryCard.tsx   ← balance display
└── DuesGrid.tsx             ← 12-month paid/unpaid grid
```

---

## Quick Reference

| I need to...                        | Go to...                                      |
|-------------------------------------|-----------------------------------------------|
| Change a color or font              | `theme/colors.ts` or `theme/typography.ts`    |
| Add a new API call                  | `features/*/repositories/*.repository.ts`     |
| Add business logic                  | `features/*/hooks/use*.ts`                    |
| Add a new page                      | `app/(role)/new-page/page.tsx`                |
| Add a new UI component              | `features/*/components/` or `components/`     |
| Add a shared type                   | `features/*/types/` or `lib/types/`           |
| Change how Supabase is connected    | `lib/supabase/client.ts`                      |
| Understand the payment status logic | `features/payments/types/payment.types.ts`    |

---

**Version**: 1.0
**System**: GFAST-MPTS
**Last Updated**: 2025
**Based on**: 4-Layer Architecture Pattern v1.0
