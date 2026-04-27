import PDFDocument from "pdfkit";
import type { ReportData } from "./report-data.service";

const COL_WIDTHS = [160, 100, 70, 80, 80, 80, 60];
const HEADERS = [
  "Full Name",
  "College",
  "Type",
  "Membership",
  "Exp Periods",
  "Paid",
  "Status",
];
const PAGE_MARGIN = 40;
const ROW_HEIGHT = 18;

export function buildPdfBuffer(report: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title block
    doc.fontSize(16).font("Helvetica-Bold").text("GCFast Payment Report", { align: "center" });
    doc.fontSize(10).font("Helvetica")
      .text(`College: ${report.college}   |   Year: ${report.year}   |   Total Members: ${report.totalMembers}`, {
        align: "center",
      });
    doc.text(`Generated: ${report.generatedAt}`, { align: "center" });
    doc.moveDown();

    // Table header
    let x = PAGE_MARGIN;
    const headerY = doc.y;

    doc.font("Helvetica-Bold").fontSize(9);
    HEADERS.forEach((h, i) => {
      doc.text(h, x, headerY, { width: COL_WIDTHS[i], align: "left" });
      x += COL_WIDTHS[i];
    });

    doc.moveTo(PAGE_MARGIN, doc.y + 4)
      .lineTo(PAGE_MARGIN + COL_WIDTHS.reduce((a, b) => a + b, 0), doc.y + 4)
      .stroke();

    doc.font("Helvetica").fontSize(8);
    doc.moveDown(0.3);

    // Data rows — add page break if needed
    for (const m of report.members) {
      if (doc.y + ROW_HEIGHT > doc.page.height - PAGE_MARGIN) {
        doc.addPage();
        doc.font("Helvetica").fontSize(8);
      }

      x = PAGE_MARGIN;
      const rowY = doc.y;
      const values = [
        m.fullName,
        m.collegeName,
        m.memberType,
        m.membershipFeePaid ? "Yes" : "No",
        String(m.periodsExpected),
        String(m.periodsPaid),
        m.status,
      ];

      values.forEach((v, i) => {
        doc.text(v, x, rowY, { width: COL_WIDTHS[i], align: "left" });
        x += COL_WIDTHS[i];
      });

      doc.moveDown(0.4);
    }

    doc.end();
  });
}
