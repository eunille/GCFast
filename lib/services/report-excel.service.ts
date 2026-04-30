import ExcelJS from "exceljs";
import type {
  ReportResult, PaymentSummaryReport, OutstandingBalanceReport,
  MembershipStatusReport, MonthlyCollectionReport, MemberStandingReport,
} from "./report-data.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Prevent Excel CSV/formula injection (OWASP: A03 Injection). */
function sanitizeCell(v: string | number | boolean): string | number | boolean {
  if (typeof v !== "string") return v;
  if (["=", "+", "-", "@", "\t", "\r"].some(t => v.startsWith(t))) return `'${v}`;
  return v;
}
function php(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(n);
}
function makeWb(title: string, scope: string, start: string, end: string, generated: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "GCFast-MPTS"; wb.created = new Date();
  const ws = wb.addWorksheet(title);
  const h = ws.addRow([`GCFast ${title}`]); h.font = { bold: true, size: 14 };
  ws.addRow(["Scope:", sanitizeCell(scope)]);
  ws.addRow(["Period:", `${start} to ${end}`]);
  ws.addRow(["Generated:", generated]);
  ws.addRow([]);
  return { wb, ws };
}
function styleHeader(ws: ExcelJS.Worksheet, row: ExcelJS.Row, count: number) {
  for (let i = 1; i <= count; i++) {
    const c = row.getCell(i);
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F497D" } };
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { horizontal: "center" };
  }
  row.commit();
}
async function finalize(wb: ExcelJS.Workbook): Promise<Buffer> {
  return Buffer.from(await wb.xlsx.writeBuffer());
}

// ─── payment_summary ──────────────────────────────────────────────────────────

async function buildPaymentSummaryExcel(r: PaymentSummaryReport): Promise<Buffer> {
  const { wb, ws } = makeWb("Payment Summary Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  ws.addRow(["Total Collected:", php(r.totalCollected)]);
  ws.addRow(["Outstanding:", php(r.outstanding)]);
  ws.addRow(["Members Paid:", `${r.membersPaid} of ${r.totalMembers} (${r.membersPaidPercent}%)`]);
  ws.addRow(["Avg. Collection:", php(r.avgCollectionPerMember)]);
  ws.addRow([]);
  const hRow = ws.addRow(["College/Department", "Total Members", "Members Paid", "Total Collected", "Outstanding", "Collection Rate"]);
  styleHeader(ws, hRow, 6);
  ws.columns = [40, 16, 16, 20, 20, 16].map((w, i) => ({ key: String(i), width: w }));
  for (const row of r.breakdown) {
    ws.addRow([sanitizeCell(row.collegeName), row.totalMembers, row.membersPaid, php(row.totalCollected), php(row.outstanding), `${row.collectionRate}%`]);
  }
  const t = ws.addRow(["Total", r.totalMembers, r.membersPaid, php(r.totalCollected), php(r.outstanding), `${r.membersPaidPercent}%`]);
  t.font = { bold: true };
  return finalize(wb);
}

// ─── outstanding_balance ──────────────────────────────────────────────────────

async function buildOutstandingBalanceExcel(r: OutstandingBalanceReport): Promise<Buffer> {
  const { wb, ws } = makeWb("Outstanding Balance Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  ws.addRow(["Total Outstanding:", php(r.totalOutstanding)]);
  ws.addRow(["Members with Balance:", `${r.membersWithBalance} of ${r.totalMembers}`]);
  ws.addRow([]);
  const hRow = ws.addRow(["Full Name", "College", "Type", "Outstanding", "Periods Paid", "Periods Expected"]);
  styleHeader(ws, hRow, 6);
  ws.columns = [30, 28, 14, 18, 14, 18].map((w, i) => ({ key: String(i), width: w }));
  for (const m of r.members) {
    ws.addRow([sanitizeCell(m.fullName), sanitizeCell(m.collegeName), sanitizeCell(m.memberType), php(m.outstandingBalance), m.periodsPaid, m.periodsExpected]);
  }
  return finalize(wb);
}

// ─── membership_status ────────────────────────────────────────────────────────

async function buildMembershipStatusExcel(r: MembershipStatusReport): Promise<Buffer> {
  const { wb, ws } = makeWb("Membership Status Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  ws.addRow(["Total Members:", r.totalMembers]);
  ws.addRow(["All Paid:", r.totalComplete]);
  ws.addRow(["Has Balance:", r.totalHasBalance]);
  ws.addRow(["Overall Complete:", `${r.overallCompletePercent}%`]);
  ws.addRow([]);
  const hRow = ws.addRow(["College/Department", "Total Members", "All Paid", "Has Balance", "Complete %"]);
  styleHeader(ws, hRow, 5);
  ws.columns = [40, 16, 14, 14, 14].map((w, i) => ({ key: String(i), width: w }));
  for (const row of r.breakdown) {
    ws.addRow([sanitizeCell(row.collegeName), row.totalMembers, row.complete, row.hasBalance, `${row.completePercent}%`]);
  }
  const t = ws.addRow(["Total", r.totalMembers, r.totalComplete, r.totalHasBalance, `${r.overallCompletePercent}%`]);
  t.font = { bold: true };
  return finalize(wb);
}

// ─── monthly_collection ───────────────────────────────────────────────────────

async function buildMonthlyCollectionExcel(r: MonthlyCollectionReport): Promise<Buffer> {
  const { wb, ws } = makeWb("Monthly Collection Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  ws.addRow(["Total Collected:", php(r.totalCollected)]);
  ws.addRow([]);
  const hRow = ws.addRow(["Month", "Total Collected", "# Payments", "Unique Members"]);
  styleHeader(ws, hRow, 4);
  ws.columns = [24, 20, 14, 16].map((w, i) => ({ key: String(i), width: w }));
  for (const m of r.months) {
    ws.addRow([sanitizeCell(m.label), php(m.totalCollected), m.paymentCount, m.uniqueMembers]);
  }
  const t = ws.addRow(["Total", php(r.totalCollected), r.months.reduce((s, m) => s + m.paymentCount, 0), ""]);
  t.font = { bold: true };
  return finalize(wb);
}

// ─── member_standing ──────────────────────────────────────────────────────────

async function buildMemberStandingExcel(r: MemberStandingReport): Promise<Buffer> {
  const { wb, ws } = makeWb("Member Standing Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  ws.addRow(["Total Members:", r.totalMembers]);
  ws.addRow(["All Paid:", r.totalComplete]);
  ws.addRow(["Has Balance:", r.totalHasBalance]);
  ws.addRow([]);
  const hRow = ws.addRow(["Full Name", "College", "Type", "Mem. Fee", "Periods Paid", "Periods Expected", "Outstanding", "Status"]);
  styleHeader(ws, hRow, 8);
  ws.columns = [30, 28, 12, 10, 14, 18, 18, 14].map((w, i) => ({ key: String(i), width: w }));
  for (const m of r.members) {
    ws.addRow([
      sanitizeCell(m.fullName), sanitizeCell(m.collegeName), sanitizeCell(m.memberType),
      m.membershipFeePaid ? "Yes" : "No", m.periodsPaid, m.periodsExpected,
      php(m.outstandingBalance), sanitizeCell(m.status),
    ]);
  }
  return finalize(wb);
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export async function buildExcelBuffer(report: ReportResult): Promise<Buffer> {
  switch (report.reportType) {
    case "payment_summary":     return buildPaymentSummaryExcel(report);
    case "outstanding_balance": return buildOutstandingBalanceExcel(report);
    case "membership_status":   return buildMembershipStatusExcel(report);
    case "monthly_collection":  return buildMonthlyCollectionExcel(report);
    case "member_standing":     return buildMemberStandingExcel(report);
  }
}
