// features/members/hooks/usePendingMembers.ts
"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/utils/auth-fetch";
import type { ApiResponse } from "@/lib/types/api-types";

export interface PendingMember {
  profileId: string;
  fullName: string | null;
  email: string | null;
  registeredAt: string | null;
}

interface UsePendingMembersReturn {
  data: PendingMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePendingMembers(): UsePendingMembersReturn {
  const [data, setData] = useState<PendingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authFetch("/api/members/pending");
        const json = (await res.json()) as ApiResponse<PendingMember[]>;
        if (!cancelled) {
          if (json.success) {
            setData(json.data ?? []);
          } else {
            setError(json.error?.message ?? "Failed to load pending members.");
          }
        }
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [tick]);

  return { data, isLoading, error, refetch: () => setTick((t) => t + 1) };
}
