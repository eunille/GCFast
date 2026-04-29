// app/(treasurer)/treasurer/payments/page.tsx
// Layer 4 — PRESENTATIONAL: Payment management page (Treasurer)

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentTable } from "@/features/payments/components/PaymentTable";
import { RecordPaymentModal } from "@/features/payments/components/RecordPaymentModal";

export default function PaymentsPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Payments
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          View member payment standing and record new payments.
        </p>
      </div>

      {/* Table panel */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <PaymentTable onRecord={(id) => setSelectedMemberId(id)} />
        </CardContent>
      </Card>

      {/* Record payment modal */}
      <RecordPaymentModal
        memberId={selectedMemberId}
        open={Boolean(selectedMemberId)}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  );
}
