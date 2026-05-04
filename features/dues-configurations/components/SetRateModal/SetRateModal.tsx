// features/dues-configurations/components/SetRateModal/SetRateModal.tsx
// Layer 4 — PRESENTATIONAL: Form to add a new dues rate (closes current automatically).

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDuesConfig } from "@/features/dues-configurations/hooks/useCreateDuesConfig";
import type { CreateDuesConfigInput } from "@/features/dues-configurations/types/dues-config.types";

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentType = "MEMBERSHIP_FEE" | "MONTHLY_DUES";
type MemberType  = "FULL_TIME" | "ASSOCIATE";

interface FormState {
  paymentType: PaymentType | "";
  memberType: MemberType | "";
  amount: string;
}

const EMPTY: FormState = {
  paymentType: "",
  memberType: "",
  amount: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetRateModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const { mutate: createConfig, isPending } = useCreateDuesConfig();

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.paymentType) next.paymentType = "Payment type is required.";
    if (!form.memberType)  next.memberType  = "Member type is required.";

    if (form.paymentType === "MEMBERSHIP_FEE" && form.memberType === "ASSOCIATE") {
      next.paymentType = "Associate members do not pay a Membership Fee.";
    }

    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0)
      next.amount = "Amount must be greater than 0.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const input: CreateDuesConfigInput = {
      paymentType: form.paymentType as PaymentType,
      memberType:  form.memberType  as MemberType,
      amount:      parseFloat(form.amount),
      effectiveFrom: new Date().toISOString().split("T")[0],
    };

    createConfig(input, {
      onSuccess: () => {
        toast.success("New rate set successfully.");
        setForm(EMPTY);
        setErrors({});
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to set rate.");
      },
    });
  }

  function handleClose() {
    if (isPending) return;
    setForm(EMPTY);
    setErrors({});
    onOpenChange(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set New Rate</DialogTitle>
        </DialogHeader>

        {/* Warning banner */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          <span>
            Setting a new rate will automatically close the current one for the same
            payment type and member type.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Payment Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select
              value={form.paymentType}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, paymentType: v as PaymentType }));
                setErrors((e) => ({ ...e, paymentType: undefined }));
              }}
            >
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBERSHIP_FEE">Membership Fee</SelectItem>
                <SelectItem value="MONTHLY_DUES">Monthly Dues</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentType && (
              <p className="text-xs text-destructive">{errors.paymentType}</p>
            )}
          </div>

          {/* Member Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memberType">Member Type</Label>
            <Select
              value={form.memberType}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, memberType: v as MemberType }));
                setErrors((e) => ({ ...e, memberType: undefined }));
              }}
            >
              <SelectTrigger id="memberType">
                <SelectValue placeholder="Select member type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem
                  value="ASSOCIATE"
                  disabled={form.paymentType === "MEMBERSHIP_FEE"}
                >
                  Associate
                  {form.paymentType === "MEMBERSHIP_FEE" && " (not applicable)"}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.memberType && (
              <p className="text-xs text-destructive">{errors.memberType}</p>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 60"
              value={form.amount}
              onChange={(e) => {
                setForm((f) => ({ ...f, amount: e.target.value }));
                setErrors((er) => ({ ...er, amount: undefined }));
              }}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Set Rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
