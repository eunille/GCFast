// features/dues-configurations/repositories/dues-config.repository.ts
// Layer 2 — DATA: Fetches dues configuration data via the API route.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { CurrentRates, DuesConfig, CreateDuesConfigInput } from "../types/dues-config.types";

export interface DuesConfigFilter {
  paymentType?: "MEMBERSHIP_FEE" | "MONTHLY_DUES";
  memberType?: "FULL_TIME" | "ASSOCIATE";
  activeOnly?: boolean;
}

export const duesConfigRepository = {
  async getCurrentRates(): Promise<CurrentRates> {
    const res = await authFetch("/api/dues-configurations/current");
    if (!res.ok) throw new Error("Failed to fetch current rates");
    const json = await res.json();
    return json.data as CurrentRates;
  },

  async getAll(filter: DuesConfigFilter = {}): Promise<DuesConfig[]> {
    const params = new URLSearchParams();
    if (filter.paymentType) params.set("paymentType", filter.paymentType);
    if (filter.memberType)  params.set("memberType", filter.memberType);
    if (filter.activeOnly !== undefined)
      params.set("activeOnly", String(filter.activeOnly));

    const qs = params.toString();
    const res = await authFetch(`/api/dues-configurations${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch dues configurations");
    const json = await res.json();
    return json.data as DuesConfig[];
  },

  async create(input: CreateDuesConfigInput): Promise<DuesConfig> {
    const res = await authFetch("/api/dues-configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message ?? "Failed to create dues configuration");
    }
    return json.data as DuesConfig;
  },
};
