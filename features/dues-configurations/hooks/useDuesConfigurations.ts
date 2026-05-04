// features/dues-configurations/hooks/useDuesConfigurations.ts
// Layer 3 — APPLICATION: Lists all dues configuration records.

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  duesConfigRepository,
  type DuesConfigFilter,
} from "@/features/dues-configurations/repositories/dues-config.repository";
import type { DuesConfig } from "@/features/dues-configurations/types/dues-config.types";

export function useDuesConfigurations(filter: DuesConfigFilter = { activeOnly: true }) {
  return useQuery<DuesConfig[]>({
    queryKey: ["dues-configurations", filter],
    queryFn: () => duesConfigRepository.getAll(filter),
    staleTime: 2 * 60 * 1000,
  });
}
