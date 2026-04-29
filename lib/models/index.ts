// lib/models/index.ts
// Single import point for all API-canonical models.
// All components, hooks, and repositories must import from here — not from feature type files.

export type { ApiUserRole, UserRole, MemberType, PaymentStatus, PaymentType, ReportFormat, ApiSuccess, ApiError, ApiResponse, PaginationMeta } from "./shared.models";
export type { AuthMe, AuthUser, InviteInput } from "./auth.models";
export type { College } from "./college.models";
export type { AcademicPeriod } from "./academic-period.models";
export type { Member, CreateMemberInput, UpdateMemberInput, MemberListQuery } from "./member.models";
export type { PaymentRecord, RecordPaymentInput, PaymentRecordQuery, PaymentHistoryQuery, PaymentSummaryRow, PaymentSummaryQuery } from "./payment.models";
export type { TreasurerDashboard, MemberDashboard } from "./dashboard.models";
export type { DuesConfig, CreateDuesConfigInput, CurrentRateEntry, CurrentRates } from "./dues-config.models";
export type { GenerateReportInput, ReportMemberRow, ReportData } from "./report.models";
