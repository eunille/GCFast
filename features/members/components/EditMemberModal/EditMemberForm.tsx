// features/members/components/EditMemberModal/EditMemberForm.tsx
// Layer 4 — PRESENTATIONAL: Pre-filled form for editing an existing member

"use client";

import { useState } from "react";
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
import { useColleges } from "@/lib/hooks/useColleges";
import type { Member, UpdateMemberInput } from "@/lib/models";

interface Props {
  member: Member;
  onSubmit: (data: UpdateMemberInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

type FieldErrors = Partial<Record<keyof UpdateMemberInput, string>>;

export function EditMemberForm({ member, onSubmit, onCancel, isLoading }: Props) {
  const { data: colleges = [] } = useColleges();

  const [form, setForm] = useState<UpdateMemberInput>({
    fullName:   member.fullName,
    email:      member.email,
    collegeId:  member.collegeId ?? undefined,
    memberType: member.memberType,
    employeeId: member.employeeId ?? undefined,
    joinedAt:   member.joinedAt ?? undefined,
    notes:      member.notes ?? undefined,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (field: keyof UpdateMemberInput, value: string | undefined) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!form.fullName || form.fullName.trim().length < 2)
      nextErrors.fullName = "Full name must be at least 2 characters";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = "Enter a valid email address";
    if (!form.memberType)
      nextErrors.memberType = "Member type is required";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="em-fullName">Full Name *</Label>
        <Input
          id="em-fullName"
          value={form.fullName ?? ""}
          onChange={(e) => set("fullName", e.target.value)}
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="em-email">Email *</Label>
        <Input
          id="em-email"
          type="email"
          value={form.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>College</Label>
        <Select
          value={form.collegeId ?? ""}
          onValueChange={(v) => set("collegeId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select college" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.collegeId && <p className="text-xs text-destructive">{errors.collegeId}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label>Member Type *</Label>
        <Select
          value={form.memberType ?? "FULL_TIME"}
          onValueChange={(v) => set("memberType", v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FULL_TIME">Full-Time</SelectItem>
            <SelectItem value="ASSOCIATE">Associate</SelectItem>
          </SelectContent>
        </Select>
        {errors.memberType && <p className="text-xs text-destructive">{errors.memberType}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="em-empId">Employee ID</Label>
        <Input
          id="em-empId"
          value={form.employeeId ?? ""}
          onChange={(e) => set("employeeId", e.target.value || undefined)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="em-joinedAt">Joined Date</Label>
        <Input
          id="em-joinedAt"
          type="date"
          value={form.joinedAt ?? ""}
          onChange={(e) => set("joinedAt", e.target.value || undefined)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="em-notes">Notes</Label>
        <Input
          id="em-notes"
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || undefined)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
