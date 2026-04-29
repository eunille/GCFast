// features/members/components/CreateMemberModal/CreateMemberForm.tsx
// Layer 4 — PRESENTATIONAL: Form for creating a new member

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
import { createMemberSchema } from "../../types/member.schemas";
import type { CreateMemberInput } from "@/lib/models";
import { ZodError } from "zod";

interface Props {
  onSubmit: (data: CreateMemberInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

type FieldErrors = Partial<Record<keyof CreateMemberInput, string>>;

export function CreateMemberForm({ onSubmit, onCancel, isLoading }: Props) {
  const { data: colleges = [] } = useColleges();

  const [form, setForm] = useState<Partial<CreateMemberInput>>({
    memberType: "FULL_TIME",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (field: keyof CreateMemberInput, value: string | undefined) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = createMemberSchema.parse(form);
      setErrors({});
      onSubmit(validated);
    } catch (err) {
      if (err instanceof ZodError) {
        const fe: FieldErrors = {};
        for (const issue of err.issues) {
          const key = issue.path[0] as keyof CreateMemberInput;
          if (!fe[key]) fe[key] = issue.message;
        }
        setErrors(fe);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Full Name */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cm-fullName">Full Name *</Label>
        <Input
          id="cm-fullName"
          placeholder="e.g. Juan dela Cruz"
          value={form.fullName ?? ""}
          onChange={(e) => set("fullName", e.target.value)}
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cm-email">Email *</Label>
        <Input
          id="cm-email"
          type="email"
          placeholder="email@example.com"
          value={form.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      {/* College */}
      <div className="flex flex-col gap-1">
        <Label>College *</Label>
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

      {/* Member Type */}
      <div className="flex flex-col gap-1">
        <Label>Member Type *</Label>
        <Select
          value={form.memberType ?? "FULL_TIME"}
          onValueChange={(v) => set("memberType", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FULL_TIME">Full-Time</SelectItem>
            <SelectItem value="ASSOCIATE">Associate</SelectItem>
          </SelectContent>
        </Select>
        {errors.memberType && <p className="text-xs text-destructive">{errors.memberType}</p>}
      </div>

      {/* Employee ID */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cm-empId">Employee ID</Label>
        <Input
          id="cm-empId"
          placeholder="Optional"
          value={form.employeeId ?? ""}
          onChange={(e) => set("employeeId", e.target.value || undefined)}
        />
      </div>

      {/* Joined Date */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cm-joinedAt">Joined Date</Label>
        <Input
          id="cm-joinedAt"
          type="date"
          value={form.joinedAt ?? ""}
          onChange={(e) => set("joinedAt", e.target.value || undefined)}
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cm-notes">Notes</Label>
        <Input
          id="cm-notes"
          placeholder="Optional"
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || undefined)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isLoading ? "Saving…" : "Add Member"}
        </Button>
      </div>
    </form>
  );
}


