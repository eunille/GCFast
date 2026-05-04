// features/members/components/CreateMemberModal/CreateMemberForm.tsx
// Layer 4 — PRESENTATIONAL: Form for creating a new member

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
  isLoading: boolean;
}

type FieldErrors = Partial<Record<keyof CreateMemberInput | "confirmPassword", string>>;

function FieldWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function CreateMemberForm({ onSubmit, isLoading }: Props) {
  const { data: colleges = [] } = useColleges();

  const [form, setForm] = useState<Partial<CreateMemberInput>>({
    memberType: "FULL_TIME",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (field: keyof CreateMemberInput, value: string | undefined) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FieldErrors = {};

    // Confirm-password check (form-only — not sent to API)
    if (form.password || confirmPassword) {
      if (form.password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    try {
      const validated = createMemberSchema.parse(form);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      onSubmit(validated);
    } catch (err) {
      if (err instanceof ZodError) {
        const fe: FieldErrors = { ...newErrors };
        for (const issue of err.issues) {
          const key = issue.path[0] as keyof CreateMemberInput;
          if (!fe[key]) fe[key] = issue.message;
        }
        setErrors(fe);
      }
    }
  };

  return (
    <form id="create-member-form" onSubmit={handleSubmit} className="flex flex-col gap-3 py-1">

      {/* ── Required fields ──────────────────────────────────────────────────── */}
      <FieldWrapper>
        <Label htmlFor="cm-fullName">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cm-fullName"
          placeholder="e.g. Juan dela Cruz"
          value={form.fullName ?? ""}
          onChange={(e) => set("fullName", e.target.value)}
        />
        <FieldError message={errors.fullName} />
      </FieldWrapper>

      <FieldWrapper>
        <Label htmlFor="cm-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cm-email"
          type="email"
          placeholder="email@example.com"
          value={form.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
        />
        <FieldError message={errors.email} />
      </FieldWrapper>

      <FieldWrapper>
        <Label>
          College <span className="text-destructive">*</span>
        </Label>
        <Select value={form.collegeId ?? ""} onValueChange={(v) => set("collegeId", v)}>
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
        <FieldError message={errors.collegeId} />
      </FieldWrapper>

      <FieldWrapper>
        <Label>
          Member Type <span className="text-destructive">*</span>
        </Label>
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
        <FieldError message={errors.memberType} />
      </FieldWrapper>

      {/* ── Login credentials ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground shrink-0">Login Credentials</span>
        <Separator className="flex-1" />
      </div>

      <p className="text-xs text-muted-foreground">
        Set a password so this member can log in immediately. Leave blank to let them register later.
      </p>

      <FieldWrapper>
        <Label htmlFor="cm-password">Password</Label>
        <div className="relative">
          <Input
            id="cm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            value={form.password ?? ""}
            onChange={(e) => set("password", e.target.value || undefined)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <FieldError message={errors.password} />
      </FieldWrapper>

      <FieldWrapper>
        <Label htmlFor="cm-confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="cm-confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <FieldError message={errors.confirmPassword} />
      </FieldWrapper>

      {/* ── Optional fields ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground shrink-0">Optional</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper>
          <Label htmlFor="cm-empId">Employee ID</Label>
          <Input
            id="cm-empId"
            placeholder="e.g. EMP-001"
            value={form.employeeId ?? ""}
            onChange={(e) => set("employeeId", e.target.value || undefined)}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label htmlFor="cm-joinedAt">Joined Date</Label>
          <Input
            id="cm-joinedAt"
            type="date"
            value={form.joinedAt ?? ""}
            onChange={(e) => set("joinedAt", e.target.value || undefined)}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper>
        <Label htmlFor="cm-notes">Notes</Label>
        <Input
          id="cm-notes"
          placeholder="Any additional notes…"
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || undefined)}
        />
      </FieldWrapper>

    </form>
  );
}
