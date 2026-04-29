// lib/models/college.models.ts
// Source of truth: API_MODELS.md — "Reference Data Models > College"

/** GET /api/colleges — sorted name ASC */
export interface College {
  id: string;
  name: string;
  code: string;
}
