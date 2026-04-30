// app/(treasurer)/treasurer/payments/record/page.tsx
// Layer 4 — PRESENTATIONAL: Full-page 3-step payment recording flow

"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PaymentStepper } from "@/features/payments/components/PaymentStepper";
import { useMember } from "@/features/members/hooks/useMember";
import { Skeleton } from "@/components/ui/skeleton";

function RecordPageInner() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("memberId");
  const { data: member, isLoading } = useMember(memberId ?? "");

  if (memberId && isLoading) {
    return (
      <div className="-m-6 p-6 min-h-full bg-white flex flex-col gap-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="-m-6 p-6 min-h-full bg-white">
      <PaymentStepper preSelectedMember={memberId ? (member ?? null) : null} />
    </div>
  );
}

export default function RecordPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="-m-6 p-6 min-h-full bg-white flex flex-col gap-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <RecordPageInner />
    </Suspense>
  );
}
