import PDFDocument from "pdfkit";
import type {
  ReportResult, PaymentSummaryReport, OutstandingBalanceReport,
  MembershipStatusReport, MonthlyCollectionReport, MemberStandingReport,
} from "./report-data.service";

const M = 40; // page margin

function php(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(n);
}

function makeDoc() {
  const doc = new PDFDocument({ margin: M, size: "A4", layout: "landscape" });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  return { doc, chunks };
}

function titleBlock(doc: InstanceType<typeof PDFDocument>, title: string, scope: string, start: string, end: string, generated: string) {
  doc.fontSize(16).font("Helvetica-Bold").text(`GCFast ${title}`, { align: "center" });
  doc.fontSize(10).font("Helvetica")
    .text(`Period: ${start} to ${end}   |   Scope: ${scope}`, { align: "center" })
    .text(`Generated: ${generated}`, { align: "center" });
  doc.moveDown();
}

function tableHeader(doc: InstanceType<typeof PDFDocument>, headers: string[], widths: number[]) {
  const y = doc.y;
  let x = M;
  doc.font("Helvetica-Bold").fontSize(9);
  headers.forEach((h, i) => { doc.text(h, x, y, { width: widths[i], align: "left" }); x += widths[i]; });
  const total = widths.reduce((a, b) => a + b, 0);
  doc.moveTo(M, doc.y + 4).lineTo(M + total, doc.y + 4).stroke();
  doc.font("Helvetica").fontSize(8);
  doc.moveDown(0.3);
}

function tableRow(doc: InstanceType<typeof PDFDocument>, cells: string[], widths: number[]) {
  const total = widths.reduce((a, b) => a + b, 0);
  if (doc.y + 18 > doc.page.height - M) { doc.addPage(); doc.font("Helvetica").fontSize(8); }
  const y = doc.y; let x = M;
  cells.forEach((v, i) => { doc.text(v, x, y, { width: widths[i], align: "left" }); x += widths[i]; });
  doc.moveDown(0.4);
  return total;
}

function finish(doc: InstanceType<typeof PDFDocument>, chunks: Buffer[]): Promise<Buffer> {
  return new Promise((res, rej) => { doc.on("end", () => res(Buffer.concat(chunks))); doc.on("error", rej); doc.end(); });
}

// ─── payment_summary ──────────────────────────────────────────────────────────

function buildPaymentSummaryPdf(r: PaymentSummaryReport): Promise<Buffer> {
  const { doc, chunks } = makeDoc();
  titleBlock(doc, "Payment Summary Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  doc.font("Helvetica").fontSize(9)
    .text(`Total Collected: ${php(r.totalCollected)}   Outstanding: ${php(r.outstanding)}   Members Paid: ${r.membersPaid}/${r.totalMembers} (${r.membersPaidPercent}%)   Avg: ${php(r.avgCollectionPerMember)}`);
  doc.moveDown();
  const W = [220, 80, 80, 100, 100, 80];
  tableHeader(doc, ["College/Department", "Total Mbrs", "Paid", "Collected", "Outstanding", "Rate"], W);
  for (const row of r.breakdown) {
    tableRow(doc, [row.collegeName, String(row.totalMembers), String(row.membersPaid), php(row.totalCollected), php(row.outstanding), `${row.collectionRate}%`], W);
  }
  doc.font("Helvetica-Bold").fontSize(8);
  tableRow(doc, ["Total", String(r.totalMembers), String(r.membersPaid), php(r.totalCollected), php(r.outstanding), `${r.membersPaidPercent}%`], W);
  return finish(doc, chunks);
}

// ─── outstanding_balance ──────────────────────────────────────────────────────

function buildOutstandingBalancePdf(r: OutstandingBalanceReport): Promise<Buffer> {
  const { doc, chunks } = makeDoc();
  titleBlock(doc, "Outstanding Balance Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  doc.font("Helvetica").fontSize(9).text(`Total Outstanding: ${php(r.totalOutstanding)}   Members with Balance: ${r.membersWithBalance} of ${r.totalMembers}`);
  doc.moveDown();
  const W = [200, 140, 80, 100, 80, 80];
  tableHeader(doc, ["Full Name", "College", "Type", "Outstanding", "Paid", "Expected"], W);
  for (const m of r.members) {
    tableRow(doc, [m.fullName, m.collegeName, m.memberType, php(m.outstandingBalance), String(m.periodsPaid), String(m.periodsExpected)], W);
  }
  return finish(doc, chunks);
}

// ─── membership_status ────────────────────────────────────────────────────────

function buildMembershipStatusPdf(r: MembershipStatusReport): Promise<Buffer> {
  const { doc, chunks } = makeDoc();
  titleBlock(doc, "Membership Status Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  doc.font("Helvetica").fontSize(9).text(`Total: ${r.totalMembers}   All Paid: ${r.totalComplete}   Has Balance: ${r.totalHasBalance}   Overall: ${r.overallCompletePercent}%`);
  doc.moveDown();
  const W = [280, 100, 80, 100, 100];
  tableHeader(doc, ["College/Department", "Total Members", "All Paid", "Has Balance", "Complete %"], W);
  for (const row of r.breakdown) {
    tableRow(doc, [row.collegeName, String(row.totalMembers), String(row.complete), String(row.hasBalance), `${row.completePercent}%`], W);
  }
  doc.font("Helvetica-Bold").fontSize(8);
  tableRow(doc, ["Total", String(r.totalMembers), String(r.totalComplete), String(r.totalHasBalance), `${r.overallCompletePercent}%`], W);
  return finish(doc, chunks);
}

// ─── monthly_collection ───────────────────────────────────────────────────────

function buildMonthlyCollectionPdf(r: MonthlyCollectionReport): Promise<Buffer> {
  const { doc, chunks } = makeDoc();
  titleBlock(doc, "Monthly Collection Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  doc.font("Helvetica").fontSize(9).text(`Total Collected: ${php(r.totalCollected)}`);
  doc.moveDown();
  const W = [200, 150, 120, 130];
  tableHeader(doc, ["Month", "Total Collected", "# Payments", "Unique Members"], W);
  for (const m of r.months) {
    tableRow(doc, [m.label, php(m.totalCollected), String(m.paymentCount), String(m.uniqueMembers)], W);
  }
  return finish(doc, chunks);
}

// ─── member_standing ──────────────────────────────────────────────────────────

function buildMemberStandingPdf(r: MemberStandingReport): Promise<Buffer> {
  const { doc, chunks } = makeDoc();
  titleBlock(doc, "Member Standing Report", r.collegeScope, r.startDate, r.endDate, r.generatedAt);
  doc.font("Helvetica").fontSize(9).text(`Total: ${r.totalMembers}   All Paid: ${r.totalComplete}   Has Balance: ${r.totalHasBalance}`);
  doc.moveDown();
  const W = [160, 110, 70, 60, 60, 70, 90, 80];
  tableHeader(doc, ["Full Name", "College", "Type", "Mem Fee", "Paid", "Expected", "Outstanding", "Status"], W);
  for (const m of r.members) {
    tableRow(doc, [m.fullName, m.collegeName, m.memberType, m.membershipFeePaid ? "Yes" : "No", String(m.periodsPaid), String(m.periodsExpected), php(m.outstandingBalance), m.status], W);
  }
  return finish(doc, chunks);
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export function buildPdfBuffer(report: ReportResult): Promise<Buffer> {
  switch (report.reportType) {
    case "payment_summary":     return buildPaymentSummaryPdf(report);
    case "outstanding_balance": return buildOutstandingBalancePdf(report);
    case "membership_status":   return buildMembershipStatusPdf(report);
    case "monthly_collection":  return buildMonthlyCollectionPdf(report);
    case "member_standing":     return buildMemberStandingPdf(report);
  }
}


const PAGE_MARGIN = 40;
