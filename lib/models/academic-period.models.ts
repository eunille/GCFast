// lib/models/academic-period.models.ts
// Source of truth: API_MODELS.md — "Reference Data Models > AcademicPeriod"

/** GET /api/academic-periods — sorted year DESC, month DESC */
export interface AcademicPeriod {
  id: string;
  label: string;
  month: number;
  year: number;
  isActive: boolean;
}
