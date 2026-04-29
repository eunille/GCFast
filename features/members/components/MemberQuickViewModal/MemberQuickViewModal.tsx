// features/members/components/MemberQuickViewModal/MemberQuickViewModal.tsx
// Layer 4 — PRESENTATIONAL: Quick-view dialog for a member (triggered from the member table)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Building2, Calendar, FileText, Briefcase } from "lucide-react";
import { useMember } from "../../hooks/useMember";
import { EditMemberModal } from "../EditMemberModal";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface InfoRowProps {
  icon: React.ReactNode;
  value: string;
}

function InfoRow({ icon, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex flex-col items-center gap-2 w-full">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="w-full flex flex-col gap-3 mt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="flex gap-3 w-full mt-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  );
}

interface Props {
  memberId: string | null;
  onClose: () => void;
}

export function MemberQuickViewModal({ memberId, onClose }: Props) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const { data: member, isLoading } = useMember(memberId ?? "");

  const handleViewFull = () => {
    onClose();
    if (memberId) router.push(`/treasurer/members/${memberId}`);
  };

  return (
    <>
      <Dialog open={!!memberId} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
          {isLoading || !member ? (
            <LoadingState />
          ) : (
            <div className="flex flex-col">
              {/* ── Header: avatar + name + badges ──────────────────────── */}
              <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-5">
                {/* Avatar */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground text-xl font-bold select-none">
                  {getInitials(member.fullName)}
                </div>

                {/* Name + college */}
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground leading-snug">
                    {member.fullName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {member.collegeName ?? "—"}
                  </p>
                </div>

                {/* Status badges */}
                <div className="flex gap-2 flex-wrap justify-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      member.isActive
                        ? "border-status-paid text-status-paid"
                        : "border-status-outstanding text-status-outstanding"
                    )}
                  >
                    {member.isActive ? "Active Member" : "Inactive"}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs font-medium border",
                      member.isActive
                        ? "bg-status-paid-bg text-status-paid border-status-paid hover:bg-status-paid-bg"
                        : "bg-status-outstanding-bg text-status-outstanding border-status-outstanding hover:bg-status-outstanding-bg"
                    )}
                  >
                    {member.isActive ? "Paid" : "Outstanding"}
                  </Badge>
                </div>
              </div>

              {/* ── Info rows ────────────────────────────────────────────── */}
              <div className="px-6 flex flex-col gap-3.5 pb-5">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  value={member.email}
                />
                {member.collegeName && (
                  <InfoRow
                    icon={<Building2 className="h-4 w-4" />}
                    value={member.collegeName}
                  />
                )}
                <InfoRow
                  icon={<Briefcase className="h-4 w-4" />}
                  value={member.memberType === "FULL_TIME" ? "Full-Time Faculty" : "Associate Faculty"}
                />
                {member.joinedAt && (
                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    value={`Joined ${formatDate(member.joinedAt)}`}
                  />
                )}
                {member.notes && (
                  <InfoRow
                    icon={<FileText className="h-4 w-4" />}
                    value={member.notes}
                  />
                )}
              </div>

              {/* ── Action buttons ───────────────────────────────────────── */}
              <div className="flex gap-3 px-6 pb-6">
                <Button
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setShowEdit(true)}
                >
                  Edit Member
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleViewFull}
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit modal — uses the already-fetched member */}
      {member && (
        <EditMemberModal
          member={member}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
