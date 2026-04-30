// features/payments/components/PaymentStepper/PaymentDetailsStep.tsx
// Layer 4 — PRESENTATIONAL: Step 2 — payment type, amount, date, academic period, notes

"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAcademicPeriods } from "@/lib/hooks/useAcademicPeriods";
import { useCurrentRates } from "@/features/dues-configurations/hooks/useCurrentRates";
import { formatCurrency } from "@/lib/utils/format";
import type { Member, RecordPaymentInput } from "@/lib/models";

export interface PaymentFormValues {
  paymentType: "MEMBERSHIP_FEE" | "MONTHLY_DUES";
  amountPaid: string;
  paymentDate: string;
  academicPeriodId: string;
  notes: string;
}

interface Props {
  member: Member;
  values: PaymentFormValues;
  onChange: (values: PaymentFormValues) => void;
  errors: Record<string, string>;
}

export function PaymentDetailsStep({ member, values, onChange, errors }: Props) {
  const { data: periods = [] } = useAcademicPeriods();
  const { data: rates } = useCurrentRates();

  const activePeriods = periods.filter((p) => p.isActive);

  // Pre-fill amount when paymentType changes
  useEffect(() => {
    if (!rates) return;
    let rate: number | undefined;
    if (values.paymentType === "MEMBERSHIP_FEE") {
      rate = rates.MEMBERSHIP_FEE_FULL_TIME?.amount;
    } else if (member.memberType === "FULL_TIME") {
      rate = rates.MONTHLY_DUES_FULL_TIME?.amount;
    } else {
      rate = rates.MONTHLY_DUES_ASSOCIATE?.amount;
    }
    if (rate !== undefined) onChange({ ...values, amountPaid: String(rate) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.paymentType, rates]);

  const set = (field: keyof PaymentFormValues) => (v: string) =>
    onChange({ ...values, [field]: v });

  return (
    <div className="flex flex-col gap-5">
      {/* Member card (read-only context) */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
          {member.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{member.fullName}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
          {member.collegeName && (
            <p className="text-xs text-muted-foreground">
              {member.collegeName}{member.collegeCode ? ` • ${member.collegeCode}` : ""}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-base font-semibold text-foreground">Payment Information</p>
        <p className="text-sm text-muted-foreground mt-0.5">Enter the payment details below</p>
      </div>

      {/* Payment Type — radio cards */}
      <div className="flex flex-col gap-1.5">
        <Label>
          Payment Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {(["MEMBERSHIP_FEE", "MONTHLY_DUES"] as const).map((type) => {
            const isSelected = values.paymentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  onChange({
                    ...values,
                    paymentType: type,
                    academicPeriodId: type === "MEMBERSHIP_FEE" ? "" : values.academicPeriodId,
                  })
                }
                className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  isSelected
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? "border-accent" : "border-muted-foreground"
                  }`}
                >
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  )}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>
                    {type === "MEMBERSHIP_FEE" ? "Membership Fee" : "Monthly Dues"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {type === "MEMBERSHIP_FEE" ? "One-time annual fee" : "Recurring monthly payment"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amountPaid">
          Payment Amount <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₱</span>
          <Input
            id="amountPaid"
            type="number"
            min="0.01"
            step="0.01"
            value={values.amountPaid}
            onChange={(e) => set("amountPaid")(e.target.value)}
            className="pl-7"
            placeholder="0.00"
          />
        </div>
        {rates && values.paymentType === "MEMBERSHIP_FEE" && rates.MEMBERSHIP_FEE_FULL_TIME && (
          <p className="text-xs text-muted-foreground">
            Standard rate: {formatCurrency(rates.MEMBERSHIP_FEE_FULL_TIME.amount)}
          </p>
        )}
        {errors.amountPaid && <p className="text-xs text-destructive">{errors.amountPaid}</p>}
      </div>

      {/* Academic Period (Monthly Dues only) */}
      {values.paymentType === "MONTHLY_DUES" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="academicPeriodId">
            Academic Period <span className="text-destructive">*</span>
          </Label>
          <Select value={values.academicPeriodId} onValueChange={set("academicPeriodId")}>
            <SelectTrigger id="academicPeriodId">
              <SelectValue placeholder="Select period…" />
            </SelectTrigger>
            <SelectContent>
              {activePeriods.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.academicPeriodId && (
            <p className="text-xs text-destructive">{errors.academicPeriodId}</p>
          )}
        </div>
      )}



      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes" className="flex gap-1">
          Notes
          <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <textarea
          id="notes"
          value={values.notes}
          onChange={(e) => set("notes")(e.target.value)}
          placeholder="Add any additional notes about this payment…"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
    </div>
  );
}

/** Builds a RecordPaymentInput from validated form values + member */
export function buildPaymentInput(
  member: Member,
  values: PaymentFormValues
): RecordPaymentInput {
  return {
    memberId: member.id,
    paymentType: values.paymentType,
    amountPaid: parseFloat(values.amountPaid),
    paymentDate: values.paymentDate,
    academicPeriodId: values.academicPeriodId || undefined,
    notes: values.notes || undefined,
  };
}

/** Client-side validation — returns error map (empty = valid) */
export function validatePaymentDetails(
  values: PaymentFormValues
): Record<string, string> {
  const errs: Record<string, string> = {};
  const amount = parseFloat(values.amountPaid);
  if (!values.amountPaid || isNaN(amount) || amount <= 0)
    errs.amountPaid = "Amount must be greater than 0";
  if (values.paymentType === "MONTHLY_DUES" && !values.academicPeriodId)
    errs.academicPeriodId = "Academic period is required for Monthly Dues";
  return errs;
}
