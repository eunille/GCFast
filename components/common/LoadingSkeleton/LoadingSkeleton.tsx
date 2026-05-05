// components/common/LoadingSkeleton/LoadingSkeleton.tsx
// Layer 4 — PRESENTATIONAL: Generic loading skeleton placeholder

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

interface Props {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 5, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Header bar */}
      <Skeleton className="h-6 w-48" />
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}
