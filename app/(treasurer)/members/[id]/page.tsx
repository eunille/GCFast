// app/(treasurer)/members/[id]/page.tsx
// Layer 4 — PRESENTATIONAL: Member detail page (treasurer only)

"use client";

export const dynamic = "force-dynamic";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MemberProfileCard } from "@/features/members/components/MemberDashboard/MemberProfileCard";
import { EditMemberModal } from "@/features/members/components/EditMemberModal";
import { PaymentHistoryTable } from "@/features/payments/components/PaymentHistoryTable";
import { RecordPaymentModal } from "@/features/payments/components/RecordPaymentModal";
import { useMember } from "@/features/members/hooks/useMember";
import { useDeactivateMember } from "@/features/members/hooks/useDeactivateMember";
import { usePaymentHistory } from "@/features/payments/hooks/usePaymentHistory";
import { toast } from "sonner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: member, isLoading, isError } = useMember(id);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateMember(id);

  const [showEdit, setShowEdit]           = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  const { data: paymentHistoryResult, isLoading: isLoadingPayments } = usePaymentHistory(id);

  if (isLoading) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (isError || !member) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <p className="text-destructive">Member not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </main>
    );
  }

  const handleDeactivate = () =>
    deactivate(undefined, {
      onSuccess: () => {
        toast.success("Member deactivated");
        setShowDeactivate(false);
        router.push("/treasurer/members");
      },
      onError: (err) => {
        toast.error("Failed to deactivate", { description: err.message });
        setShowDeactivate(false);
      },
    });

  return (
    <main className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/treasurer/members")}
        className="self-start text-accent hover:text-accent/80"
      >
        ← Back to Members
      </Button>

      {/* Profile card */}
      <MemberProfileCard member={member} />

      {/* Action row */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowEdit(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Edit Member
        </Button>

        {member.isActive && (
          <Button
            variant="outline"
            onClick={() => setShowRecordPayment(true)}
          >
            Record Payment
          </Button>
        )}

        {!member.profileId && (
          <Button variant="outline" disabled title="Send invite email to this member">
            Invite to Portal
          </Button>
        )}

        {member.isActive && (
          <Button
            variant="outline"
            onClick={() => setShowDeactivate(true)}
            className="border-destructive text-destructive hover:bg-destructive/5"
          >
            Deactivate
          </Button>
        )}
      </div>

      {/* Payment history */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold text-base text-foreground mb-4">Payment History</p>
          <PaymentHistoryTable
            payments={paymentHistoryResult?.data ?? []}
            isLoading={isLoadingPayments}
          />
        </CardContent>
      </Card>

      {/* Edit modal */}
      <EditMemberModal
        member={member}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />

      {/* Record payment modal */}
      <RecordPaymentModal
        memberId={id}
        open={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
      />

      {/* Deactivate confirm dialog */}
      <Dialog open={showDeactivate} onOpenChange={setShowDeactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will deactivate{" "}
            <span className="font-medium text-foreground">{member.fullName}</span>.
            Payment history is preserved but no new payments can be recorded.
            This action cannot be undone from the UI.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeactivate(false)}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeactivating}
              onClick={handleDeactivate}
            >
              {isDeactivating ? "Deactivating…" : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}


