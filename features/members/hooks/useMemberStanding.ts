// features/members/hooks/useMemberStanding.ts
// Layer 3 — APPLICATION: Derives standing label and status for a member

"use client";

import type { Member } from "@/lib/models";

export function useMemberStanding(member: Member) {
  return {
    isActive: member.isActive,
    standingLabel: member.isActive ? "Active" : "Inactive",
    canRecordPayments: member.isActive,
  };
}

