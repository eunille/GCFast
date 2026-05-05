// lib/models/payment.models.ts
// Source of truth: API_MODELS.md — "Payment Models"

import type { PaymentType, PaymentStatus, MemberType } from "./shared.models";

/** GET /api/payments, POST /api/payments response */
export interface PaymentRecord {
  id: string;
  memberId: string;
  paymentType: PaymentType;
  amountPaid: number;
  paymentDate: string;              // ISO Date YYYY-MM-DD (date payment was physically made)
  academicPeriodId: string | null;  // null for MEMBERSHIP_FEE
  periodMonth: number | null;       // 1–12: month of the academic period being paid (not payment date)
  periodYear: number | null;        // year of the academic period being paid (not payment date)
  periodLabel: string | null;       // display label e.g. "January 2026"
  referenceNumber: string | null;
  notes: string | null;
  recordedBy: string;               // UUID — treasurer user id
  createdAt: string;                // ISO 8601
}

/** POST /api/payments body */
export interface RecordPaymentInput {
  memberId: string;
  paymentType: PaymentType;
  amountPaid: number;
  paymentDate: string;              // ISO Date YYYY-MM-DD
  academicPeriodId?: string;        // REQUIRED when paymentType = "MONTHLY_DUES"
  referenceNumber?: string;
  notes?: string;
}

/**
 * GET /api/payments — extended record with joined member + period data.
 * Returned when the API route joins members and academic_periods.
 */
export interface PaymentTransaction extends PaymentRecord {
  memberName: string;
  memberEmail: string;
  periodLabel: string | null; // null for MEMBERSHIP_FEE
}

/** Query params for GET /api/payments */
export interface PaymentRecordQuery {
  page?: number;
  pageSize?: number;
  memberId?: string;
  paymentType?: PaymentType;
  collegeId?: string;
  status?: "COMPLETE" | "HAS_BALANCE";
}

/** Query params for GET /api/payments/member/:memberId */
export interface PaymentHistoryQuery {
  page?: number;
  pageSize?: number;
  paymentType?: PaymentType;
  year?: number;
  sortBy?: "payment_date" | "amount_paid";
  sortOrder?: "asc" | "desc";
}

/**
 * GET /api/payments/summaries
 * Raw snake_case from the member_payment_summary DB view.
 * Map to camelCase in the repository layer before use in components.
 */
export interface PaymentSummaryRow {
  member_id: string;
  full_name: string;
  email: string;
  employee_id: string | null;
  member_type: MemberType;
  joined_at: string | null;
  college_id: string;
  college_name: string;
  college_code: string;
  membership_fee_paid: boolean;
  membership_fee_amount_paid: number;
  periods_paid: number;
  periods_expected: number;
  months_paid: number[];
  total_dues_paid: number;
  last_payment_date: string | null;
  outstanding_balance: number;
  status: PaymentStatus;
}

/** Query params for GET /api/payments/summaries */
export interface PaymentSummaryQuery {
  page?: number;
  pageSize?: number;
  sortBy?: "full_name" | "outstanding_balance" | "college_name" | "periods_paid";
  sortOrder?: "asc" | "desc";
  search?: string;
  memberId?: string;
  collegeId?: string;
  memberType?: MemberType;
  status?: PaymentStatus;
  hasMembershipFee?: boolean;
  month?: number;
  year?: number;
}
