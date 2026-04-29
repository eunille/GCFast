// features/members/components/CreateMemberModal/CreateMemberModal.tsx
// Layer 4 — PRESENTATIONAL: Dialog wrapper for creating a new member

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateMemberForm } from "./CreateMemberForm";
import { useCreateMember } from "../../hooks/useCreateMember";
import { toast } from "sonner";

export function CreateMemberModal() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateMember();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 h-9 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill in the member details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <CreateMemberForm
          key={open ? "open" : "closed"}
          isLoading={isPending}
          onSubmit={(data) =>
            mutate(data, {
              onSuccess: () => {
                toast.success("Member added successfully");
                setOpen(false);
              },
              onError: (err) => {
                toast.error("Failed to add member", { description: err.message });
              },
            })
          }
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-member-form"
            disabled={isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPending ? "Saving…" : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



