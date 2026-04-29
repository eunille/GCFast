// features/dues-configurations/types/dues-config.types.ts
// Re-exports canonical types from lib/models — do not define types here.
// Source of truth: lib/models/dues-config.models.ts

export type { DuesConfig, CreateDuesConfigInput, CurrentRateEntry, CurrentRates } from "@/lib/models";

// DuesConfigRow is an internal DB mapping type — not part of the API model.
// Kept here because it is used only by the server-side route and mapper.
export type DuesConfigRow = {
  id: string;
  payment_type: "MEMBERSHIP_FEE" | "MONTHLY_DUES";
  member_type: "FULL_TIME" | "ASSOCIATE";
  amount: string;            // Supabase returns NUMERIC as string
  effective_from: string;
  effective_until: string | null;
  created_at: string;
};
