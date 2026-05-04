// features/payments/components/PaymentStepper/ConfirmationStep.tsx
// Layer 4 — PRESENTATIONAL: Step 3 — review details before submitting

"use client";

import { formatCurrency } from "@/lib/utils/format";
import { MONTHLY_FEE } from "./PaymentDetailsStep";
import { useCurrentRates } from "@/features/dues-configurations/hooks/useCurrentRates";
import type { Member } from "@/lib/models";
import type { PaymentFormValues } from "./PaymentDetailsStep";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Props {
  member: Member;
  values: PaymentFormValues;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-3 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

export function ConfirmationStep({ member, values }: Props) {
  const { data: rates } = useCurrentRates();

  const monthlyFee =
    member.memberType === "FULL_TIME"
      ? (rates?.MONTHLY_DUES_FULL_TIME?.amount ?? MONTHLY_FEE)
      : (rates?.MONTHLY_DUES_ASSOCIATE?.amount ?? MONTHLY_FEE);

  const isMonthlyDues = values.paymentType === "MONTHLY_DUES";
  const totalAmount = isMonthlyDues
    ? values.selectedMonths.length * monthlyFee
    : parseFloat(values.amountPaid);

  const selectedMonthLabels = [...values.selectedMonths]
    .sort((a, b) => a - b)
    .map((m) => MONTHS_SHORT[m - 1])
    .join(", ");

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
          <Row label="Member" value={member.fullName} />
          {member.collegeName && <Row label="College" value={member.collegeName} />}
          <Row
            label="Payment Type"
            value={isMonthlyDues ? "Monthly Dues" : "Membership Fee"}
          />

          {isMonthlyDues && (
            <>
              <Row
                label={`Month${values.selectedMonths.length > 1 ? "s" : ""} (${values.selectedMonths.length})`}
                value={selectedMonthLabels}
              />
              <Row label="Rate per Month" value={formatCurrency(monthlyFee)} />
            </>
          )}

          <Row
            label="Payment Date"
            value={new Date().toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />

          {/* Total — highlighted */}
          <div className="flex justify-between items-center py-3 gap-4">
            <span className="text-sm font-semibold text-foreground">Total Amount</span>
            <span className="text-base font-bold text-accent">
              {formatCurrency(isNaN(totalAmount) ? 0 : totalAmount)}
            </span>
          </div>

          {values.notes && <Row label="Notes" value={values.notes} />}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {isMonthlyDues
          ? `This will record ${values.selectedMonths.length} payment${values.selectedMonths.length > 1 ? "s" : ""} and update the member's status immediately.`
          : "This will record the payment and update the member's payment status immediately."}{" "}
        This action cannot be undone from the UI.
      </p>
    </div>
  );
}
