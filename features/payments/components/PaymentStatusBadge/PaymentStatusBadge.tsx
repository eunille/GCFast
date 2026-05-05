// features/payments/components/PaymentStatusBadge/PaymentStatusBadge.tsx
// Layer 4 — PRESENTATIONAL: Renders COMPLETE / HAS_BALANCE badge

import type { PaymentStatus } from "@/lib/models";

interface Props {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: Props) {
  if (status === "COMPLETE") {
    return (
      <span className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-semibold leading-none bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
        All Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-semibold leading-none bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
      Has Balance
    </span>
  );
}

