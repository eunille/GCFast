// app/(treasurer)/treasurer/members/[id]/page.tsx
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MemberProfileCard } from "@/features/members/components/MemberDashboard/MemberProfileCard";
import { EditMemberModal } from "@/features/members/components/EditMemberModal";
import { PaymentHistoryTable } from "@/features/payments/components/PaymentHistoryTable";
import { useMember } from "@/features/members/hooks/useMember";
import { useDeactivateMember } from "@/features/members/hooks/useDeactivateMember";
import { usePaymentHistory } from "@/features/payments/hooks/usePaymentHistory";
import { useApproveAccount } from "@/features/members/hooks/useApproveAccount";
import { toast } from "sonner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: member, isLoading, isError } = useMember(id);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateMember(id);
  const { data: paymentHistoryResult, isLoading: isLoadingPayments } = usePaymentHistory(id);
  const { approve, isPending: isApproving } = useApproveAccount((result) => {
    toast.success(
      result.action === "approve" ? "Account activated" : "Account rejected",
      { description: result.email ?? undefined }
    );
  });

  const [showEdit, setShowEdit]             = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const isPending = member?.accountStatus === "pending";

  if (isLoading) {
    return (
      <main className="-m-6 p-6 min-h-full bg-white max-w-2xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (isError || !member) {
    return (
      <main className="-m-6 p-6 min-h-full bg-white">
        <p className="text-destructive">Member not found or failed to load.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
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
    <main className="-m-6 p-6 min-h-full bg-white">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
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
        {isPending ? (
          /* ── Pending account: only approve/reject ──────────────────────── */
          <>
            <Button
              disabled={isApproving}
              onClick={() => member.profileId && void approve(member.profileId, "approve")}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isApproving ? "Activating…" : "Activate Account"}
            </Button>
            <Button
              variant="outline"
              disabled={isApproving}
              onClick={() => member.profileId && void approve(member.profileId, "reject")}
              className="border-destructive text-destructive hover:bg-destructive/5"
            >
              Reject
            </Button>
          </>
        ) : (
          /* ── Active / Inactive account: full actions ───────────────────── */
          <>
            <Button
              onClick={() => setShowEdit(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Edit Member
            </Button>

            {member.isActive && (
              <Button
                variant="outline"
                onClick={() => router.push(`/treasurer/payments/record?memberId=${id}`)}
              >
                Record Payment
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
          </>
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

      {/* Deactivate confirm dialog */}
      <Dialog open={showDeactivate} onOpenChange={setShowDeactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Member?</DialogTitle>
            <DialogDescription>
              This will deactivate{" "}
              <span className="font-medium">{member.fullName}</span> and prevent new payments from being recorded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeactivate(false)} disabled={isDeactivating}>
              Cancel
            </Button>
            <Button
              disabled={isDeactivating}
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeactivating ? "Deactivating…" : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </main>
  );
}
