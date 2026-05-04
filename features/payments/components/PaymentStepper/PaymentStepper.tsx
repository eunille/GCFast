// features/payments/components/PaymentStepper/PaymentStepper.tsx
// Layer 4 — PRESENTATIONAL: 3-step payment recording orchestrator

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { StepperHeader } from "./StepperHeader";
import { SelectMemberStep } from "./SelectMemberStep";
import {
  PaymentDetailsStep,
  validatePaymentDetails,
  buildPaymentInputs,
  MONTHLY_FEE,
  type PaymentFormValues,
} from "./PaymentDetailsStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { useRecordBulkPayment } from "../../hooks/useRecordBulkPayment";
import { useAcademicPeriods } from "@/lib/hooks/useAcademicPeriods";
import { useCurrentRates } from "@/features/dues-configurations/hooks/useCurrentRates";
import { formatCurrency } from "@/lib/utils/format";
import type { Member } from "@/lib/models";

// ─── Types ────────────────────────────────────────────────────────────────────

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type RecordSuccess =
  | { kind: "fee"; memberName: string; amountPaid: number }
  | {
      kind: "dues";
      memberName: string;
      succeededCount: number;
      failedCount: number;
      months: number[];
      totalPaid: number;
    };

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM: PaymentFormValues = {
  paymentType: "MONTHLY_DUES",
  selectedMonths: [],
  amountPaid: "",
  notes: "",
};

interface Props {
  /** If provided, pre-select this member and skip to step 2 */
  preSelectedMember?: Member | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentStepper({ preSelectedMember = null }: Props) {
  const router = useRouter();
  const { mutate, isPending } = useRecordBulkPayment();
  const { data: periods = [] } = useAcademicPeriods();
  const { data: rates } = useCurrentRates();

  const [step, setStep] = useState<1 | 2 | 3>(preSelectedMember ? 2 : 1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(preSelectedMember);
  const [formValues, setFormValues] = useState<PaymentFormValues>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RecordSuccess | null>(null);

  // ── Step 1 → 2 ───────────────────────────────────────────────────
  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setStep(2);
  };

  // ── Step 2 → 3 ───────────────────────────────────────────────────
  const handleNextFromDetails = () => {
    const errs = validatePaymentDetails(formValues);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setStep(3);
  };

  // ── Step 3 → submit ──────────────────────────────────────────────
  const handleSubmit = () => {
    if (!selectedMember) return;
    const inputs = buildPaymentInputs(selectedMember, formValues, periods);

    mutate(inputs, {
      onSuccess: ({ succeeded, failed }) => {
        if (formValues.paymentType === "MEMBERSHIP_FEE") {
          setResult({
            kind: "fee",
            memberName: selectedMember.fullName,
            amountPaid: parseFloat(formValues.amountPaid),
          });
        } else {
          const monthlyFee =
            selectedMember.memberType === "FULL_TIME"
              ? (rates?.MONTHLY_DUES_FULL_TIME?.amount ?? MONTHLY_FEE)
              : (rates?.MONTHLY_DUES_ASSOCIATE?.amount ?? MONTHLY_FEE);

          setResult({
            kind: "dues",
            memberName: selectedMember.fullName,
            succeededCount: succeeded.length,
            failedCount: failed.length,
            months: [...formValues.selectedMonths].sort((a, b) => a - b),
            totalPaid: succeeded.length * monthlyFee,
          });

          if (failed.length > 0) {
            toast.warning(
              `${succeeded.length} of ${inputs.length} month(s) recorded. ${failed.length} already existed.`
            );
          }
        }
      },
      onError: (err) => {
        toast.error("Failed to record payment", { description: err.message });
      },
    });
  };

  // ── Reset ────────────────────────────────────────────────────────
  const handleReset = () => {
    setResult(null);
    setStep(1);
    setSelectedMember(null);
    setFormValues(DEFAULT_FORM);
    setFormErrors({});
  };

  // ── Back ─────────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else router.push("/treasurer/payments");
  };

  const subtitle: Record<1 | 2 | 3, string> = {
    1: "Select a member to record payment",
    2: "Enter payment information",
    3: "Review and confirm payment",
  };

  return (
    <>
      <div className="flex flex-col gap-6 max-w-2xl w-full mx-auto">
        {/* Back + title */}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Record Payment
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">{subtitle[step]}</p>
        </div>

        {/* Step indicator */}
        <StepperHeader currentStep={step} />

        {/* Step content */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          {step === 1 && <SelectMemberStep onSelect={handleMemberSelect} />}

          {step === 2 && selectedMember && (
            <PaymentDetailsStep
              member={selectedMember}
              values={formValues}
              onChange={setFormValues}
              errors={formErrors}
            />
          )}

          {step === 3 && selectedMember && (
            <ConfirmationStep member={selectedMember} values={formValues} />
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={handleBack} disabled={isPending}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step === 1 && (
            <span className="text-sm text-muted-foreground self-center">
              Click a member above to continue
            </span>
          )}

          {step === 2 && (
            <Button onClick={handleNextFromDetails}>Review Payment</Button>
          )}

          {step === 3 && (
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Recording…" : "Record Payment"}
            </Button>
          )}
        </div>
      </div>

      {/* ── Success modal ───────────────────────────────────────────── */}
      <Dialog
        open={result !== null}
        onOpenChange={(open) => {
          if (!open) handleReset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Payment Recorded Successfully</DialogTitle>
          {result && (
            <div className="flex flex-col items-center gap-6 py-2 text-center">
              {/* Animated check */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>

              {/* Headline */}
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {result.kind === "dues" && result.failedCount > 0
                    ? "Payments Partially Recorded"
                    : "Payment Recorded!"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.memberName}&apos;s account has been updated.
                </p>
              </div>

              {/* Details card */}
              <div className="w-full rounded-lg border border-border bg-muted/30 p-4 text-left">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Payment Details
                  </p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Completed
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member</span>
                    <span className="text-sm font-semibold">{result.memberName}</span>
                  </div>

                  {result.kind === "fee" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Type</span>
                        <span className="text-sm font-semibold">Membership Fee</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(result.amountPaid)}
                        </span>
                      </div>
                    </>
                  )}

                  {result.kind === "dues" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Type</span>
                        <span className="text-sm font-semibold">Monthly Dues</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Months Recorded ({result.succeededCount})
                        </span>
                        <span className="text-sm font-semibold">
                          {result.months.map((m) => MONTHS_SHORT[m - 1]).join(", ")}
                        </span>
                      </div>
                      {result.failedCount > 0 && (
                        <div className="flex items-start gap-2 rounded-md bg-orange-50 border border-orange-200 p-2.5">
                          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-orange-700">
                            {result.failedCount} month
                            {result.failedCount > 1 ? "s were" : " was"} already paid and skipped.
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Paid</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(result.totalPaid)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Record Another
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => router.push("/treasurer/overview")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
