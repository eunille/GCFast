// features/members/hooks/useMemberStanding.ts
// Layer 3 — APPLICATION: Derives standing label and status for a member

"use client";

import type { Member } from "../types/member.types";

export function useMemberStanding(member: Member) {
  const isActive = member.status === "ACTIVE";

  return {
    isActive,
    standingLabel: isActive ? "Active" : "Inactive",
    canRecordPayments: isActive,
  };
}
