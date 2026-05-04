// app/(member)/member/profile/page.tsx
// Layer 4 — PRESENTATIONAL: Member self-service profile page

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Pencil, KeyRound, Shield, Briefcase, User, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useMemberProfile } from "@/features/members/hooks/useMemberProfile";
import { EditProfileModal } from "@/features/members/components/MemberProfile/EditProfileModal";
import { ChangePasswordModal } from "@/features/members/components/MemberProfile/ChangePasswordModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function memberTypeLabel(memberType: string): string {
  return memberType === "FULL_TIME" ? "Full-Time Member" : "Associate Member";
}

// ─── Profile Skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-52 rounded-xl" />
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberProfilePage() {
  const { data: member, isLoading, isError } = useMemberProfile();

  const [editOpen, setEditOpen]       = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !member) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        Failed to load your profile. Please refresh.
      </p>
    );
  }

  const initials = getInitials(member.fullName);

  return (
    <>
      <div className="flex flex-col gap-6 max-w-2xl">

        {/* ── Page heading ──────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-sm mt-1 text-muted-foreground">View and manage your account information</p>
        </div>

        {/* ── Profile header card ──────────────────────────────────────────── */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="h-16 w-16 shrink-0 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-foreground truncate">{member.fullName}</h2>
                  <Badge variant={member.isActive ? "default" : "secondary"} className="shrink-0">
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{memberTypeLabel(member.memberType)}</p>
                {member.joinedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {formatDate(member.joinedAt)}
                  </p>
                )}
              </div>

              {/* Edit button */}
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Personal Information ─────────────────────────────────────────── */}
        <SectionCard
          title="Personal Information"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Full Name"      value={member.fullName} />
            <InfoRow label="Email Address"  value={member.email} />
            <InfoRow label="Contact Number" value={undefined} />
            <InfoRow label="Address"        value={undefined} />
          </div>
        </SectionCard>

        {/* ── Employment Information ───────────────────────────────────────── */}
        <SectionCard
          title="Employment Information"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Employee ID" value={member.employeeId} />
            <InfoRow label="College"     value={member.collegeName} />
            <InfoRow label="Department"  value={undefined} />
            <InfoRow label="Notes"       value={member.notes} />
          </div>
        </SectionCard>

        {/* ── Membership Information ───────────────────────────────────────── */}
        <SectionCard
          title="Membership Information"
          icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
              <Badge
                variant={member.isActive ? "default" : "secondary"}
                className="w-fit mt-0.5"
              >
                {member.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <InfoRow label="Member Since"    value={formatDate(member.joinedAt)} />
            <InfoRow label="Membership Type" value={memberTypeLabel(member.memberType)} />
          </div>
        </SectionCard>

        {/* ── Security Settings ────────────────────────────────────────────── */}
        <SectionCard
          title="Security Settings"
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setPasswordOpen(true)}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Change Password
            </Button>
          </div>
        </SectionCard>

      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <EditProfileModal
        member={member}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </>
  );
}
