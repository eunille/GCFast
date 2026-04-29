// features/payments/components/PaymentStepper/PaymentSuccessView.tsx
// Layer 4 — PRESENTATIONAL: Post-submit success state

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import type { PaymentTransaction } from "@/lib/models";

interface Props {
  payment: PaymentTransaction;
  onRecordAnother: () => void;
  onGoToDashboard: () => void;
}

export function PaymentSuccessView({ payment, onRecordAnother, onGoToDashboard }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {/* Icon */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle className="h-8 w-8" />
        </div>
      </div>

      {/* Headline */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Payment Recorded Successfully!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The payment has been recorded and the member&apos;s account has been updated.
        </p>
      </div>

      {/* Details card */}
      <div className="w-full max-w-sm rounded-lg border border-border bg-muted/30 p-5 text-left">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Payment Details
          </p>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            Completed
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Member</span>
            <span className="text-sm font-semibold">{payment.memberName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payment Type</span>
            <span className="text-sm font-semibold">
              {payment.paymentType === "MEMBERSHIP_FEE" ? "Membership Fee" : "Monthly Dues"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-sm font-bold text-emerald-600">
              {formatCurrency(payment.amountPaid)}
            </span>
          </div>
          {payment.referenceNumber && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Receipt No.</span>
              <span className="text-sm font-semibold">{payment.referenceNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-sm">
        <Button variant="outline" className="flex-1" onClick={onRecordAnother}>
          Record Another Payment
        </Button>
        <Button className="flex-1" onClick={onGoToDashboard}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
