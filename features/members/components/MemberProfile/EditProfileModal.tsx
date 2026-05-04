// features/members/components/MemberProfile/EditProfileModal.tsx
// Layer 4 — PRESENTATIONAL: Modal for member to edit their own profile fields

"use client";

import { useState } from "react";
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
import { useUpdateMemberProfile } from "../../hooks/useMemberProfile";
import { toast } from "sonner";
import type { Member } from "@/lib/models";
import type { SelfUpdateMemberInput } from "../../types/member.schemas";

interface Props {
  member: Member;
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ member, open, onClose }: Props) {
  const mutation = useUpdateMemberProfile();

  const [form, setForm] = useState<SelfUpdateMemberInput>({
    fullName:   member.fullName,
    employeeId: member.employeeId ?? "",
    notes:      member.notes ?? "",
  });

  const set = (field: keyof SelfUpdateMemberInput, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SelfUpdateMemberInput = {};
    if (form.fullName   !== member.fullName)     payload.fullName   = form.fullName;
    if (form.employeeId !== (member.employeeId ?? "")) payload.employeeId = form.employeeId || undefined;
    if (form.notes      !== (member.notes ?? ""))     payload.notes      = form.notes || undefined;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile updated", { description: "Your changes have been saved." });
        onClose();
      },
      onError: (err) => {
        toast.error("Update failed", {
          description: err instanceof Error ? err.message : "Something went wrong.",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ep-fullName">Full Name</Label>
            <Input
              id="ep-fullName"
              value={form.fullName ?? ""}
              onChange={(e) => set("fullName", e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ep-employeeId">Employee ID</Label>
            <Input
              id="ep-employeeId"
              value={form.employeeId ?? ""}
              onChange={(e) => set("employeeId", e.target.value)}
              placeholder="e.g. EMP-001"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ep-notes">Notes / Additional Info</Label>
            <Input
              id="ep-notes"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional information"
              maxLength={500}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
