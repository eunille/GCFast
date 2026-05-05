// features/members/hooks/useApproveAccount.ts
// Layer 3 — APPLICATION: Approve or reject a pending member account.

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/utils/auth-fetch";
import type { ApiResponse } from "@/lib/types/api-types";

type ApproveAction = "approve" | "reject";

interface ApproveAccountResult {
  profileId: string;
  action: ApproveAction;
  accountStatus: string;
  fullName: string | null;
  email: string | null;
}

interface UseApproveAccountReturn {
  approve: (profileId: string, action: ApproveAction) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

export function useApproveAccount(
  onSuccess?: (result: ApproveAccountResult) => void
): UseApproveAccountReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation<ApproveAccountResult, Error, { profileId: string; action: ApproveAction }>({
    mutationFn: async ({ profileId, action }) => {
      const res = await authFetch("/api/auth/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, action }),
      });
      const json = (await res.json()) as ApiResponse<ApproveAccountResult>;
      if (!json.success) {
        throw new Error(json.error?.message ?? "Failed to update account status.");
      }
      return json.data!;
    },
    onSuccess: (result) => {
      // Invalidate all members queries (list + detail) so the UI updates immediately.
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      onSuccess?.(result);
    },
  });

  return {
    approve: (profileId, action) => mutation.mutateAsync({ profileId, action }).then(() => undefined),
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
