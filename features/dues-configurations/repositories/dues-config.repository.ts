// features/dues-configurations/repositories/dues-config.repository.ts
// Layer 2 — DATA: Fetches dues configuration data via the API route.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { CurrentRates } from "../types/dues-config.types";

export const duesConfigRepository = {
  async getCurrentRates(): Promise<CurrentRates> {
    const res = await authFetch("/api/dues-configurations/current");

    if (!res.ok) {
      throw new Error("Failed to fetch current rates");
    }

    const json = await res.json();
    return json.data as CurrentRates;
  },
};
