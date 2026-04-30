// features/members/components/EditMemberModal/EditMemberModal.tsx
// Layer 4 — PRESENTATIONAL: Dialog wrapper for editing a member

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditMemberForm } from "./EditMemberForm";
import { useUpdateMember } from "../../hooks/useUpdateMember";
import { toast } from "sonner";
import type { Member } from "@/lib/models";

interface Props {
  member: Member;
  open: boolean;
  onClose: () => void;
}

export function EditMemberModal({ member, open, onClose }: Props) {
  const { mutate, isPending } = useUpdateMember(member.id);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <EditMemberForm
          member={member}
          isLoading={isPending}
          onCancel={onClose}
          onSubmit={(data) =>
            mutate(data, {
              onSuccess: () => {
                toast.success("Member updated successfully");
                onClose();
              },
              onError: (err) => {
                toast.error("Failed to update member", { description: err.message });
              },
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}


