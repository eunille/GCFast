// features/payments/components/PaymentStepper/ConfirmationStep.tsx
// Layer 4 — PRESENTATIONAL: Step 3 — review details before submitting

import { formatCurrency } from "@/lib/utils/format";
import type { Member } from "@/lib/models";
import type { PaymentFormValues } from "./PaymentDetailsStep";
import type { AcademicPeriod } from "@/lib/models";

interface Props {
  member: Member;
  values: PaymentFormValues;
  periods: AcademicPeriod[];
}

function row(label: string, value: string) {
  return (
    <div className="flex justify-between items-start py-3 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

export function ConfirmationStep({ member, values, periods }: Props) {
  const periodLabel =
    values.paymentType === "MONTHLY_DUES" && values.academicPeriodId
      ? periods.find((p) => p.id === values.academicPeriodId)?.label ?? "—"
      : null;

  const amount = parseFloat(values.amountPaid);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-base font-semibold text-foreground">Confirm Payment Details</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review the details below before recording
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex flex-col divide-y">
          {row("Member", member.fullName)}
          {member.collegeName && row("College", member.collegeName)}
          {row(
            "Payment Type",
            values.paymentType === "MEMBERSHIP_FEE" ? "Membership Fee" : "Monthly Dues"
          )}
          {periodLabel && row("Academic Period", periodLabel)}
          {row("Payment Date", new Date(values.paymentDate).toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day: "numeric",
          }))}
          {row("Amount", formatCurrency(isNaN(amount) ? 0 : amount))}
          {values.notes && row("Notes", values.notes)}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        This will record the payment and update the member&apos;s payment status immediately.
        This action cannot be undone from the UI.
      </p>
    </div>
  );
}
