// features/reports/components/ReportFilters/ReportFilters.tsx
// Layer 4 — PRESENTATIONAL: Filter controls for report generation

import type { ReportFilter } from "../../types/report.types";

interface Props {
  filter: Partial<ReportFilter>;
  onChange: (filter: Partial<ReportFilter>) => void;
  onGenerate: () => void;
}

export function ReportFilters(_props: Props) {
  return null;
}

