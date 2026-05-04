// app/(treasurer)/treasurer/dues/page.tsx
// Layer 4 — PRESENTATIONAL: Dues configuration management page (treasurer only).

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDuesConfigurations } from "@/features/dues-configurations/hooks/useDuesConfigurations";
import {
  DuesConfigTable,
  DuesConfigTableSkeleton,
} from "@/features/dues-configurations/components/DuesConfigTable";
import { SetRateModal } from "@/features/dues-configurations/components/SetRateModal";

export default function DuesConfigPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);

  const { data: configs, isLoading, isError } = useDuesConfigurations({
    activeOnly: !showHistory,
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dues Configuration</h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Manage membership fee and monthly dues rates. Rates are append-only — setting a new
            rate closes the current one automatically.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Settings2 className="h-4 w-4 mr-2" />
          Set New Rate
        </Button>
      </div>

      {/* History toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-history"
          checked={showHistory}
          onCheckedChange={(v) => setShowHistory(Boolean(v))}
        />
        <Label htmlFor="show-history" className="cursor-pointer text-sm">
          Show rate history
        </Label>
      </div>

      {/* Table */}
      {isLoading && <DuesConfigTableSkeleton />}

      {isError && (
        <p className="text-sm text-destructive py-8 text-center">
          Failed to load dues configurations. Please refresh.
        </p>
      )}

      {!isLoading && !isError && configs && (
        <DuesConfigTable configs={configs} />
      )}

      {/* Modal */}
      <SetRateModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
