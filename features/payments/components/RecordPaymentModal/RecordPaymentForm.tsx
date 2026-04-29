// features/payments/components/RecordPaymentModal/RecordPaymentForm.tsx
// Layer 4 — PRESENTATIONAL: Form fields for recording a payment

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
import { useMember } from "@/features/members/hooks/useMember";
import type { RecordPaymentInput } from "@/lib/models";

interface Props {
  memberId: string;
  onSubmit: (data: RecordPaymentInput) => void;
  isLoading: boolean;
}

export function RecordPaymentForm({ memberId, onSubmit, isLoading }: Props) {
  const { data: member } = useMember(memberId);
  const { data: periods = [] } = useAcademicPeriods();
  const { data: rates } = useCurrentRates();

  const [paymentType, setPaymentType] = useState<"MEMBERSHIP_FEE" | "MONTHLY_DUES">("MONTHLY_DUES");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [academicPeriodId, setAcademicPeriodId] = useState("");

  // Clear academicPeriodId when switching away from MONTHLY_DUES
  const handlePaymentTypeChange = (v: "MEMBERSHIP_FEE" | "MONTHLY_DUES") => {
    setPaymentType(v);
    if (v === "MEMBERSHIP_FEE") setAcademicPeriodId("");
  };
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill amount when paymentType or member changes
  useEffect(() => {
    if (!rates || !member) return;
    let rate: number | undefined;
    if (paymentType === "MEMBERSHIP_FEE") {
      rate = rates.MEMBERSHIP_FEE_FULL_TIME?.amount;
    } else if (member.memberType === "FULL_TIME") {
      rate = rates.MONTHLY_DUES_FULL_TIME?.amount;
    } else {
      rate = rates.MONTHLY_DUES_ASSOCIATE?.amount;
    }
    if (rate !== undefined) setAmountPaid(String(rate));
  }, [paymentType, rates, member]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const amount = parseFloat(amountPaid);
    if (!amountPaid || isNaN(amount) || amount <= 0)
      errs.amountPaid = "Amount must be greater than 0";
    if (!paymentDate) errs.paymentDate = "Date is required";
    if (paymentType === "MONTHLY_DUES" && !academicPeriodId)
      errs.academicPeriodId = "Academic period is required for Monthly Dues";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      memberId,
      paymentType,
      amountPaid: parseFloat(amountPaid),
      paymentDate,
      academicPeriodId: academicPeriodId || undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });
  };

  const activePeriods = periods.filter((p) => p.isActive);

  return (
    <form id="record-payment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Member (read-only display) */}
      {member && (
        <div>
          <Label className="text-xs text-muted-foreground">Member</Label>
          <p className="text-sm font-medium mt-0.5">{member.fullName}</p>
        </div>
      )}

      {/* Payment Type */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paymentType">
          Payment Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={paymentType}
          onValueChange={(v) => handlePaymentTypeChange(v as "MEMBERSHIP_FEE" | "MONTHLY_DUES")}
        >
          <SelectTrigger id="paymentType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONTHLY_DUES">Monthly Dues</SelectItem>
            <SelectItem value="MEMBERSHIP_FEE">Membership Fee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amountPaid">
          Amount (PHP) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="amountPaid"
          type="number"
          min="0.01"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="0.00"
        />
        {errors.amountPaid && (
          <p className="text-xs text-destructive">{errors.amountPaid}</p>
        )}
      </div>

      {/* Academic Period (only for Monthly Dues) */}
      {paymentType === "MONTHLY_DUES" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="academicPeriodId">
            Academic Period <span className="text-destructive">*</span>
          </Label>
          <Select value={academicPeriodId} onValueChange={setAcademicPeriodId}>
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

      {/* Payment Date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paymentDate">
          Payment Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
        {errors.paymentDate && (
          <p className="text-xs text-destructive">{errors.paymentDate}</p>
        )}
      </div>

      {/* Reference Number (optional) */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="referenceNumber" className="text-muted-foreground">
          Reference Number{" "}
          <span className="text-xs font-normal">(optional)</span>
        </Label>
        <Input
          id="referenceNumber"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="e.g. OR-2024-001"
        />
      </div>

      {/* Notes (optional) */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes" className="text-muted-foreground">
          Notes <span className="text-xs font-normal">(optional)</span>
        </Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes…"
        />
      </div>

      {/* Hidden submit — triggered by DialogFooter button via form="record-payment-form" */}
      <button type="submit" disabled={isLoading} className="hidden" aria-hidden />
    </form>
  );
}

