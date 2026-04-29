// features/payments/components/PaymentStatusBadge/PaymentStatusBadge.tsx
// Layer 4 — PRESENTATIONAL: Renders COMPLETE / HAS_BALANCE badge

import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/lib/models";

interface Props {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: Props) {
  if (status === "COMPLETE") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium">
        All Paid
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 font-medium">
      Has Balance
    </Badge>
  );
}

