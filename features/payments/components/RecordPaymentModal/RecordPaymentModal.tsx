// features/payments/components/RecordPaymentModal/RecordPaymentModal.tsx
// Layer 4 — PRESENTATIONAL: Modal wrapper for recording a payment

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecordPaymentForm } from "./RecordPaymentForm";
import { useRecordPayment } from "../../hooks/useRecordPayment";
import { toast } from "sonner";
import type { RecordPaymentInput } from "@/lib/models";

interface Props {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
}

export function RecordPaymentModal({ memberId, open, onClose }: Props) {
  const { mutate, isPending } = useRecordPayment();

  const handleSubmit = (data: RecordPaymentInput) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Payment recorded successfully");
        onClose();
      },
      onError: (err) => {
        // 409 = duplicate payment blocked server-side
        toast.error("Failed to record payment", { description: err.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Fill in the payment details below. Required fields are marked with{" "}
            <span className="text-destructive">*</span>.
          </DialogDescription>
        </DialogHeader>

        {memberId && (
          <RecordPaymentForm
            key={memberId}
            memberId={memberId}
            onSubmit={handleSubmit}
            isLoading={isPending}
          />
        )}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            form="record-payment-form"
            disabled={isPending || !memberId}
          >
            {isPending ? "Saving…" : "Save Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
