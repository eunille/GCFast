// lib/models/dues-config.models.ts
// Source of truth: API_MODELS.md — "Dues Configuration Models"

import type { PaymentType, MemberType } from "./shared.models";

/** GET /api/dues-configurations */
export interface DuesConfig {
  id: string;
  paymentType: PaymentType;
  memberType: MemberType;
  amount: number;
  effectiveFrom: string;         // ISO Date YYYY-MM-DD
  effectiveUntil: string | null; // null = currently active
  createdAt: string;             // ISO 8601
}

/** POST /api/dues-configurations body */
export interface CreateDuesConfigInput {
  paymentType: PaymentType;
  memberType: MemberType;
  amount: number;
  effectiveFrom: string;         // ISO Date YYYY-MM-DD
}

/** Single entry inside CurrentRates */
export interface CurrentRateEntry {
  id: string;
  amount: number;
  effectiveFrom: string;
}

/** GET /api/dues-configurations/current */
export interface CurrentRates {
  MEMBERSHIP_FEE_FULL_TIME?: CurrentRateEntry;
  MONTHLY_DUES_FULL_TIME?: CurrentRateEntry;
  MONTHLY_DUES_ASSOCIATE?: CurrentRateEntry;
}
