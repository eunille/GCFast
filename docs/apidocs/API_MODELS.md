# GFAST-MPTS API Models

These TypeScript interfaces map directly to the backend validation schemas and database shapes.

## Shared Types & Enums

\`\`\`typescript
export type UserRole = "treasurer" | "member";
export type MemberType = "FULL_TIME" | "ASSOCIATE";
export type PaymentStatus = "COMPLETE" | "HAS_BALANCE";
export type PaymentType = "MEMBERSHIP_FEE" | "MONTHLY_DUES";
export type ReportFormat = "json" | "excel" | "pdf";
\`\`\`

## Pagination Meta Model

\`\`\`typescript
export interface PaginationMeta {
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
\`\`\`

## Member Models

\`\`\`typescript
export interface Member {
  id: string; // UUID
  profileId: string | null;
  collegeId: string;
  collegeName?: string;
  collegeCode?: string;
  employeeId?: string;
  fullName: string;
  email: string;
  memberType: MemberType;
  joinedAt?: string; // ISO Date YYYY-MM-DD
  isActive: boolean;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CreateMemberInput {
  fullName: string;
  email: string;
  collegeId: string; // UUID
  memberType: MemberType;
  employeeId?: string;
  joinedAt?: string; // ISO Date YYYY-MM-DD
  notes?: string;
}

export type UpdateMemberInput = Partial<CreateMemberInput>;
\`\`\`

## Payment Models

\`\`\`typescript
export interface RecordPaymentInput {
  memberId: string; // UUID
  paymentType: PaymentType;
  amountPaid: number;
  paymentDate: string; // ISO Date YYYY-MM-DD
  academicPeriodId?: string; // Required if MONTHLY_DUES
  referenceNumber?: string;
  notes?: string;
}
\`\`\`

## Dashboard Models

\`\`\`typescript
export interface TreasurerDashboardStats {
  totalMembers: number;
  totalCollected: number;
  membersWithBalance: number;
  membersComplete: number;
  collectionByCollege: {
    collegeId: string;
    collegeName: string;
    total: number;
    memberCount: number;
  }[];
}

export interface MemberDashboardStats {
  memberId: string;
  fullName: string;
  college: string;
  memberType: string;
  membershipFeePaid: boolean;
  periodsExpected: number;
  periodsPaid: number;
  monthsPaid: number[]; // e.g., [1, 2, 3]
  outstandingBalance: number;
  status: PaymentStatus;
  lastPaymentDate: string | null;
}
\`\`\`

## Report Models

\`\`\`typescript
export interface GenerateReportInput {
  collegeId?: string; // UUID, omit for all
  year: number;
  format: ReportFormat;
}
\`\`\`

## Dues Configuration Models

\`\`\`typescript
export interface DuesConfig {
  id: string;                                    // UUID
  paymentType: PaymentType;
  memberType: MemberType;
  amount: number;                                // e.g. 200.00
  effectiveFrom: string;                         // ISO Date YYYY-MM-DD
  effectiveUntil: string | null;                 // null = currently active
  createdAt: string;                             // ISO 8601
}

export interface CreateDuesConfigInput {
  paymentType: PaymentType;
  memberType: MemberType;
  amount: number;                                // must be > 0
  effectiveFrom: string;                         // ISO Date YYYY-MM-DD
}

/** Flat map returned by GET /api/dues-configurations/current */
export interface CurrentRates {
  MEMBERSHIP_FEE_FULL_TIME?: { id: string; amount: number; effectiveFrom: string };
  MONTHLY_DUES_FULL_TIME?:   { id: string; amount: number; effectiveFrom: string };
  MONTHLY_DUES_ASSOCIATE?:   { id: string; amount: number; effectiveFrom: string };
}
\`\`\`

> **Note:** \`MEMBERSHIP_FEE\` only applies to \`FULL_TIME\` members. Attempting to create an \`ASSOCIATE\` membership fee returns \`400 VALIDATION_ERROR\`.
> Rates are append-only — submitting a new rate automatically closes the previous one (\`effective_until = effectiveFrom - 1 day\`).