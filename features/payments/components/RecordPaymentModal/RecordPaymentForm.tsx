// features/payments/components/RecordPaymentModal/RecordPaymentForm.tsx
// Layer 4 — PRESENTATIONAL: Form fields for recording a payment

import type { RecordPaymentInput } from "../../types/payment.schemas";

interface Props {
  memberId: string;
  onSubmit: (data: RecordPaymentInput) => void;
  isLoading: boolean;
}

export function RecordPaymentForm(_props: Props) {
  return null;
}

