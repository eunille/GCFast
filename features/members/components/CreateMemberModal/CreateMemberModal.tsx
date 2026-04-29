// features/members/components/CreateMemberModal/CreateMemberModal.tsx
// Layer 4 — PRESENTATIONAL: Dialog wrapper for creating a new member

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateMemberForm } from "./CreateMemberForm";
import { useCreateMember } from "../../hooks/useCreateMember";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateMemberModal({ open, onClose }: Props) {
  const { mutate, isPending } = useCreateMember();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <CreateMemberForm
          isLoading={isPending}
          onCancel={onClose}
          onSubmit={(data) =>
            mutate(data, {
              onSuccess: () => {
                toast.success("Member added successfully");
                onClose();
              },
              onError: (err) => {
                toast.error("Failed to add member", { description: err.message });
              },
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}


