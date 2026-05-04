// features/payments/components/PaymentStepper/PaymentDetailsStep.tsx
// Layer 4 — PRESENTATIONAL: Step 2 — payment type selection + month grid or fee amount

"use client";

import { useEffect } from "react";
import { Check, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAcademicPeriods } from "@/lib/hooks/useAcademicPeriods";
import { useCurrentRates } from "@/features/dues-configurations/hooks/useCurrentRates";
import { useMemberPaymentSummary } from "../../hooks/useMemberPaymentSummary";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { Member, RecordPaymentInput, AcademicPeriod } from "@/lib/models";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Fixed monthly dues fee — also used in ConfirmationStep */
export const MONTHLY_FEE = 60;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentFormValues {
  paymentType: "MEMBERSHIP_FEE" | "MONTHLY_DUES";
  /** Month numbers (1–12) selected for bulk MONTHLY_DUES */
  selectedMonths: number[];
  /** Amount — used only for MEMBERSHIP_FEE */
  amountPaid: string;
  notes: string;
}

interface Props {
  member: Member;
  values: PaymentFormValues;
  onChange: (values: PaymentFormValues) => void;
  errors: Record<string, string>;
}

// ─── Month grid ───────────────────────────────────────────────────────────────

interface MonthGridProps {
  paidMonths: number[];
  availableMonths: number[];
  selectedMonths: number[];
  onToggle: (month: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function MonthGrid({
  paidMonths,
  availableMonths,
  selectedMonths,
  onToggle,
  onSelectAll,
  onClearAll,
}: MonthGridProps) {
  /** Months that can actually be toggled */
  const selectableMonths = availableMonths.filter((m) => !paidMonths.includes(m));
  const allSelected =
    selectableMonths.length > 0 &&
    selectableMonths.every((m) => selectedMonths.includes(m));

  return (
    <div className="flex flex-col gap-3">
      {/* Select All / Clear All row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={allSelected ? onClearAll : onSelectAll}
          disabled={selectableMonths.length === 0}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            selectableMonths.length === 0
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-accent hover:text-accent/80"
          )}
        >
          <div
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors",
              allSelected
                ? "border-accent bg-accent"
                : "border-muted-foreground/40"
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-white" />}
          </div>
          {allSelected ? "Deselect all" : "Select all available"}
        </button>

        {selectedMonths.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 6-column uniform grid */}
      <div className="grid grid-cols-6 gap-2">
        {MONTHS_SHORT.map((label, idx) => {
          const month = idx + 1;
          const isPaid = paidMonths.includes(month);
          const isAvailable = availableMonths.includes(month);
          const isSelected = selectedMonths.includes(month);
          const isDisabled = isPaid || !isAvailable;

          return (
            <button
              key={month}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onToggle(month)}
              title={
                isPaid
                  ? `${label} — already paid`
                  : !isAvailable
                    ? `${label} — no academic period configured`
                    : `${label} — click to ${isSelected ? "deselect" : "select"}`
              }
              className={cn(
                // Fixed height for perfect uniformity
                "flex flex-col items-center justify-center gap-1 rounded-lg border-2 h-16 w-full text-xs font-medium transition-colors select-none",
                isPaid &&
                  "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-not-allowed",
                !isDisabled &&
                  isSelected &&
                  "border-accent bg-accent/10 text-accent",
                !isDisabled &&
                  !isSelected &&
                  "border-border hover:border-accent/50 text-foreground cursor-pointer",
                !isPaid &&
                  !isAvailable &&
                  "border-dashed border-border/40 bg-muted/20 text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {isPaid ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2",
                    isSelected
                      ? "border-accent bg-accent"
                      : !isAvailable
                        ? "border-muted-foreground/20"
                        : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              )}
              <span>{label}</span>
              {isPaid && (
                <span className="text-[9px] text-emerald-600 leading-none">Paid</span>
              )}
              {!isPaid && !isAvailable && (
                <Minus className="h-3 w-3 text-muted-foreground/30" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PaymentDetailsStep({ member, values, onChange, errors }: Props) {
  const { data: periods = [] } = useAcademicPeriods();
  const { data: rates } = useCurrentRates();
  const { data: summary } = useMemberPaymentSummary(member.id);

  const activePeriods = periods.filter((p) => p.isActive);
  const availableMonths = activePeriods.map((p) => p.month);
  const paidMonths: number[] = summary?.months_paid ?? [];

  /** True if the member has already paid the membership fee */
  const hasPaidMembershipFee = summary?.membership_fee_paid === true;

  // If membership fee is already paid and we're on that tab, switch to MONTHLY_DUES
  useEffect(() => {
    if (hasPaidMembershipFee && values.paymentType === "MEMBERSHIP_FEE") {
      onChange({ ...values, paymentType: "MONTHLY_DUES" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPaidMembershipFee]);

  // Pre-fill amount when switching to MEMBERSHIP_FEE
  useEffect(() => {
    if (values.paymentType !== "MEMBERSHIP_FEE" || !rates) return;
    const rate = rates.MEMBERSHIP_FEE_FULL_TIME?.amount;
    if (rate !== undefined) onChange({ ...values, amountPaid: String(rate) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.paymentType, rates]);

  const set = (field: keyof PaymentFormValues) => (v: string) =>
    onChange({ ...values, [field]: v });

  const toggleMonth = (month: number) => {
    const current = values.selectedMonths;
    const next = current.includes(month)
      ? current.filter((m) => m !== month)
      : [...current, month];
    onChange({ ...values, selectedMonths: next });
  };

  const selectableMonths = availableMonths.filter((m) => !paidMonths.includes(m));

  const handleSelectAll = () => {
    const union = Array.from(new Set([...values.selectedMonths, ...selectableMonths]));
    onChange({ ...values, selectedMonths: union });
  };

  const handleClearAll = () => {
    onChange({ ...values, selectedMonths: [] });
  };

  const monthlyFee =
    member.memberType === "FULL_TIME"
      ? (rates?.MONTHLY_DUES_FULL_TIME?.amount ?? MONTHLY_FEE)
      : (rates?.MONTHLY_DUES_ASSOCIATE?.amount ?? MONTHLY_FEE);

  const bulkTotal = values.selectedMonths.length * monthlyFee;

  // Payment type options — only show MEMBERSHIP_FEE if not already paid
  const paymentTypes: Array<{ type: "MEMBERSHIP_FEE" | "MONTHLY_DUES"; label: string; sub: string }> = [
    ...(!hasPaidMembershipFee
      ? [{ type: "MEMBERSHIP_FEE" as const, label: "Membership Fee", sub: "One-time annual fee" }]
      : []),
    { type: "MONTHLY_DUES" as const, label: "Monthly Dues", sub: "Select one or more months to pay" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Member card (read-only context) */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
          {member.fullName
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{member.fullName}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
          {member.collegeName && (
            <p className="text-xs text-muted-foreground">
              {member.collegeName}
              {member.collegeCode ? ` • ${member.collegeCode}` : ""}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-base font-semibold text-foreground">Payment Information</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select the payment type and fill in the details below
        </p>
      </div>

      {/* Payment Type — radio cards */}
      <div className="flex flex-col gap-1.5">
        <Label>
          Payment Type <span className="text-destructive">*</span>
        </Label>
        <div className={cn("grid gap-3", paymentTypes.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
          {paymentTypes.map(({ type, label, sub }) => {
            const isSelected = values.paymentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  onChange({
                    ...values,
                    paymentType: type,
                    selectedMonths: type === "MONTHLY_DUES" ? values.selectedMonths : [],
                  })
                }
                className={cn(
                  "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                  isSelected
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected ? "border-accent" : "border-muted-foreground"
                  )}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                <div>
                  <p className={cn("text-sm font-semibold", isSelected ? "text-accent" : "text-foreground")}>
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Informational banner if membership fee already paid */}
        {hasPaidMembershipFee && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 mt-1">
            Membership fee has already been paid — only monthly dues can be recorded.
          </p>
        )}
      </div>

      {/* ── MONTHLY_DUES: month grid ───────────────────────────────────────── */}
      {values.paymentType === "MONTHLY_DUES" && (
        <div className="flex flex-col gap-3">
          <Label>
            Select Months <span className="text-destructive">*</span>
          </Label>

          <MonthGrid
            paidMonths={paidMonths}
            availableMonths={availableMonths}
            selectedMonths={values.selectedMonths}
            onToggle={toggleMonth}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />

          {errors.selectedMonths && (
            <p className="text-xs text-destructive">{errors.selectedMonths}</p>
          )}

          {/* Running total */}
          {values.selectedMonths.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
              <div className="text-sm text-foreground">
                <span className="font-medium">
                  {values.selectedMonths.length} month
                  {values.selectedMonths.length > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground">
                  {" "}× {formatCurrency(monthlyFee)}/month
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground font-medium">Total</span>
                <span className="text-base font-bold text-accent">
                  {formatCurrency(bulkTotal)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERSHIP_FEE: amount input ──────────────────────────────────── */}
      {values.paymentType === "MEMBERSHIP_FEE" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amountPaid">
            Payment Amount <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              ₱
            </span>
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
          {rates?.MEMBERSHIP_FEE_FULL_TIME && (
            <p className="text-xs text-muted-foreground">
              Standard rate: {formatCurrency(rates.MEMBERSHIP_FEE_FULL_TIME.amount)}
            </p>
          )}
          {errors.amountPaid && (
            <p className="text-xs text-destructive">{errors.amountPaid}</p>
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

// ─── Helpers (used by PaymentStepper) ────────────────────────────────────────

/**
 * Builds one or more RecordPaymentInput objects from the form values.
 * MONTHLY_DUES → one input per selected month (mapped to academic period ID).
 * MEMBERSHIP_FEE → single input.
 */
export function buildPaymentInputs(
  member: Member,
  values: PaymentFormValues,
  periods: AcademicPeriod[]
): RecordPaymentInput[] {
  const today = new Date().toISOString().slice(0, 10);

  if (values.paymentType === "MEMBERSHIP_FEE") {
    return [
      {
        memberId: member.id,
        paymentType: "MEMBERSHIP_FEE",
        amountPaid: parseFloat(values.amountPaid),
        paymentDate: today,
        notes: values.notes || undefined,
      },
    ];
  }

  // MONTHLY_DUES: one record per selected month
  const activePeriods = periods.filter((p) => p.isActive);
  return values.selectedMonths.map((month) => {
    const period = activePeriods.find((p) => p.month === month);
    return {
      memberId: member.id,
      paymentType: "MONTHLY_DUES",
      amountPaid: MONTHLY_FEE,
      paymentDate: today,
      academicPeriodId: period?.id,
      notes: values.notes || undefined,
    };
  });
}

/** Client-side validation. Returns error map — empty means valid. */
export function validatePaymentDetails(
  values: PaymentFormValues
): Record<string, string> {
  const errs: Record<string, string> = {};

  if (values.paymentType === "MONTHLY_DUES") {
    if (values.selectedMonths.length === 0)
      errs.selectedMonths = "Please select at least one month";
  } else {
    const amount = parseFloat(values.amountPaid);
    if (!values.amountPaid || isNaN(amount) || amount <= 0)
      errs.amountPaid = "Amount must be greater than 0";
  }

  return errs;
}
