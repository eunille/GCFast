import ExcelJS from "exceljs";
import type { ReportData } from "./report-data.service";

const COLUMNS = [
  { header: "Full Name", key: "fullName", width: 30 },
  { header: "College", key: "collegeName", width: 20 },
  { header: "Type", key: "memberType", width: 12 },
  { header: "Membership Fee", key: "membershipFeePaid", width: 16 },
  { header: "Periods Expected", key: "periodsExpected", width: 18 },
  { header: "Periods Paid", key: "periodsPaid", width: 14 },
  { header: "Outstanding Balance", key: "outstandingBalance", width: 20 },
  { header: "Status", key: "status", width: 12 },
  { header: "Last Payment Date", key: "lastPaymentDate", width: 20 },
];

/**
 * Prevent Excel CSV/formula injection (OWASP: A03 Injection).
 * Prefixes string values starting with formula triggers with a single quote.
 */
function sanitizeCell(value: string | number | boolean): string | number | boolean {
  if (typeof value !== "string") return value;
  const TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];
  if (TRIGGERS.some((t) => value.startsWith(t))) {
    return `'${value}`;
  }
  return value;
}

export async function buildExcelBuffer(report: ReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "GCFast-MPTS";
  wb.created = new Date();

  const ws = wb.addWorksheet(`Report ${report.year}`);

  // Summary rows
  ws.addRow(["GCFast Payment Report"]);
  ws.addRow(["College:", report.college]);
  ws.addRow(["Year:", report.year]);
  ws.addRow(["Generated:", report.generatedAt]);
  ws.addRow(["Total Members:", report.totalMembers]);
  ws.addRow([]);

  // Header row
  const headerRowIndex = ws.rowCount + 1;
  ws.columns = COLUMNS;
  const headerRow = ws.getRow(headerRowIndex);

  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F497D" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center" };
  });

  headerRow.commit();

  // Data rows — sanitize all string values to prevent formula injection
  for (const m of report.members) {
    ws.addRow([
      sanitizeCell(m.fullName),
      sanitizeCell(m.collegeName),
      sanitizeCell(m.memberType),
      m.membershipFeePaid ? "Yes" : "No",
      m.periodsExpected,
      m.periodsPaid,
      m.outstandingBalance,
      sanitizeCell(m.status),
      sanitizeCell(m.lastPaymentDate ?? "—"),
    ]);
  }

  ws.columns.forEach((col) => {
    if (col.width === undefined) col.width = 14;
  });

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
