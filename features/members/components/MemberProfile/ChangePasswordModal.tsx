// features/members/components/MemberProfile/ChangePasswordModal.tsx
// Layer 4 — PRESENTATIONAL: Modal for member to change their own account password

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const mutation = useChangePassword();

  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [mismatch, setMismatch]           = useState(false);

  const reset = () => {
    setNewPassword("");
    setConfirmPassword("");
    setMismatch(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    mutation.mutate(newPassword, {
      onSuccess: () => {
        toast.success("Password updated", { description: "Your password has been changed successfully." });
        handleClose();
      },
      onError: (err) => {
        toast.error("Password change failed", {
          description: err instanceof Error ? err.message : "Something went wrong.",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cp-new">New Password</Label>
            <div className="relative">
              <Input
                id="cp-new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setMismatch(false); }}
                required
                minLength={6}
                maxLength={72}
                placeholder="At least 6 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cp-confirm">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="cp-confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setMismatch(false); }}
                required
                minLength={6}
                maxLength={72}
                placeholder="Repeat new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mismatch && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating…" : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
