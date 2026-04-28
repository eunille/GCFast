// features/dues-configurations/hooks/useCurrentRates.ts
// Layer 3 — APPLICATION: Fetches currently active dues rates for payment form pre-fill.

"use client";

import { useQuery } from "@tanstack/react-query";
import { duesConfigRepository } from "@/features/dues-configurations/repositories/dues-config.repository";
import type { CurrentRates } from "@/features/dues-configurations/types/dues-config.types";

export function useCurrentRates() {
  return useQuery<CurrentRates>({
    queryKey: ["dues-configurations", "current"],
    queryFn: () => duesConfigRepository.getCurrentRates(),
    staleTime: 5 * 60 * 1000, // rates rarely change — cache for 5 min
  });
}
