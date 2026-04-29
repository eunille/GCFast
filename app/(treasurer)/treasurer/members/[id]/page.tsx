// app/(treasurer)/treasurer/members/[id]/page.tsx
// Layer 4 — PRESENTATIONAL: Member detail page (treasurer only)

"use client";

export const dynamic = "force-dynamic";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { useMember } from "@/features/members/hooks/useMember";
import { useDeactivateMember } from "@/features/members/hooks/useDeactivateMember";
import { toast } from "sonner";
import { colors, spacing } from "@/theme";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: member, isLoading, isError } = useMember(id);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateMember(id);

  const [showEdit, setShowEdit]             = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  if (isLoading) {
    return (
      <main style={{ padding: spacing[6] }}>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (isError || !member) {
    return (
      <main style={{ padding: spacing[6] }}>
        <p style={{ color: colors.status.outstanding }}>
          Member not found or failed to load.
        </p>
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
    <main style={{ padding: spacing[6], maxWidth: 640, margin: "0 auto" }}>
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/treasurer/members")}
        style={{ marginBottom: spacing[4], color: colors.brand.accent }}
      >
        ← Back to Members
      </Button>

      {/* Profile card */}
      <MemberProfileCard member={member} />

      {/* Action row */}
      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => setShowEdit(true)}
          style={{ backgroundColor: colors.brand.accent }}
        >
          Edit Member
        </Button>

        {member.isActive && (
          <Button
            variant="outline"
            onClick={() => setShowDeactivate(true)}
            style={{ borderColor: colors.status.outstanding, color: colors.status.outstanding }}
          >
            Deactivate
          </Button>
        )}
      </div>

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
          </DialogHeader>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            This will deactivate{" "}
            <span className="font-medium" style={{ color: colors.text.primary }}>
              {member.fullName}
            </span>
            . Payment history is preserved but no new payments can be recorded.
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
              disabled={isDeactivating}
              onClick={handleDeactivate}
              style={{ backgroundColor: colors.status.outstanding }}
            >
              {isDeactivating ? "Deactivating…" : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
