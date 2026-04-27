// lib/utils/csv.ts
// Layer 1 — DOMAIN: Pure utility to convert data to CSV and trigger a browser download

/**
 * Converts an array of objects to a CSV string.
 *
 * @param headers  Array of { key, label } — defines column order and header names
 * @param rows     Array of plain objects; values are stringified
 * @returns        CSV string with a header row followed by data rows
 */
export function toCsvString<T extends Record<string, unknown>>(
  headers: { key: keyof T; label: string }[],
  rows: T[]
): string {
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    // Wrap in quotes if the value contains a comma, double-quote, or newline
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const headerRow = headers.map((h) => escape(h.label)).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escape(row[h.key])).join(",")
  );

  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser file download with the given CSV content.
 *
 * @param filename  Download filename (e.g. "report-2025.csv")
 * @param csv       CSV string returned by toCsvString()
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
