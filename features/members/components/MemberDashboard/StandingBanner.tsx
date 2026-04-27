// features/members/components/MemberDashboard/StandingBanner.tsx
// Layer 4 — PRESENTATIONAL: Full-width banner showing member standing status

import type { PaymentStatus } from "@/features/payments/types/payment.types";

interface Props {
  status: PaymentStatus;
  memberName: string;
}

export function StandingBanner(_props: Props) {
  return null;
}
