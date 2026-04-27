// features/dues-configurations/types/dues-config.types.ts

export type DuesConfig = {
  id: string;
  paymentType: "MEMBERSHIP_FEE" | "MONTHLY_DUES";
  memberType: "FULL_TIME" | "ASSOCIATE";
  amount: number;
  effectiveFrom: string;      // ISO date
  effectiveUntil: string | null;
  createdAt: string;
};

export type DuesConfigRow = {
  id: string;
  payment_type: "MEMBERSHIP_FEE" | "MONTHLY_DUES";
  member_type: "FULL_TIME" | "ASSOCIATE";
  amount: string;            // Supabase returns NUMERIC as string
  effective_from: string;
  effective_until: string | null;
  created_at: string;
};
