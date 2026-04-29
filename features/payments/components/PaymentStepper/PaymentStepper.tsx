// features/payments/components/PaymentStepper/PaymentStepper.tsx
// Layer 4 — PRESENTATIONAL: 3-step payment recording orchestrator

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StepperHeader } from "./StepperHeader";
import { SelectMemberStep } from "./SelectMemberStep";
import {
  PaymentDetailsStep,
  validatePaymentDetails,
  buildPaymentInput,
  type PaymentFormValues,
} from "./PaymentDetailsStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { PaymentSuccessView } from "./PaymentSuccessView";
import { useRecordPayment } from "../../hooks/useRecordPayment";
import { useAcademicPeriods } from "@/lib/hooks/useAcademicPeriods";
import type { Member, PaymentTransaction } from "@/lib/models";

const DEFAULT_FORM: PaymentFormValues = {
  paymentType: "MONTHLY_DUES",
  amountPaid: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  academicPeriodId: "",
  referenceNumber: "",
  notes: "",
};

interface Props {
  /** If provided, pre-select this member and skip to step 2 */
  preSelectedMember?: Member | null;
}

export function PaymentStepper({ preSelectedMember = null }: Props) {
  const router = useRouter();
  const { mutate, isPending } = useRecordPayment();
  const { data: periods = [] } = useAcademicPeriods();

  const [step, setStep] = useState<1 | 2 | 3 | "success">(
    preSelectedMember ? 2 : 1
  );
  const [selectedMember, setSelectedMember] = useState<Member | null>(preSelectedMember);
  const [formValues, setFormValues] = useState<PaymentFormValues>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PaymentTransaction | null>(null);

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
    const input = buildPaymentInput(selectedMember, formValues);
    mutate(input, {
      onSuccess: (data) => {
        // Enrich with member name for success view (API returns PaymentRecord, not Transaction)
        const enriched: PaymentTransaction = {
          ...data,
          memberName: selectedMember.fullName,
          memberEmail: selectedMember.email,
          periodLabel: null,
        };
        setResult(enriched);
        setStep("success");
      },
      onError: (err) => {
        toast.error("Failed to record payment", { description: err.message });
      },
    });
  };

  // ── Reset (record another) ───────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setSelectedMember(null);
    setFormValues(DEFAULT_FORM);
    setFormErrors({});
    setResult(null);
  };

  // ── Back logic ───────────────────────────────────────────────────
  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else router.push("/treasurer/payments");
  };

  // ── Stepper subtitle text ────────────────────────────────────────
  const subtitle: Record<1 | 2 | 3, string> = {
    1: "Select a member to record payment",
    2: "Enter payment information",
    3: "Review and confirm payment",
  };

  if (step === "success" && result) {
    return (
      <div className="mx-auto max-w-lg w-full">
        <PaymentSuccessView
          payment={result}
          onRecordAnother={handleReset}
          onGoToDashboard={() => router.push("/treasurer/overview")}
        />
      </div>
    );
  }

  return (
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Record Payment</h1>
        <p className="text-sm mt-1 text-muted-foreground">{subtitle[step as 1 | 2 | 3]}</p>
      </div>

      {/* Step indicator */}
      <StepperHeader currentStep={step as 1 | 2 | 3} />

      {/* Step content */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        {step === 1 && (
          <SelectMemberStep onSelect={handleMemberSelect} />
        )}

        {step === 2 && selectedMember && (
          <PaymentDetailsStep
            member={selectedMember}
            values={formValues}
            onChange={setFormValues}
            errors={formErrors}
          />
        )}

        {step === 3 && selectedMember && (
          <ConfirmationStep
            member={selectedMember}
            values={formValues}
            periods={periods}
          />
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
          <Button onClick={handleNextFromDetails}>
            Review Payment
          </Button>
        )}

        {step === 3 && (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Recording…" : "Record Payment"}
          </Button>
        )}
      </div>
    </div>
  );
}
