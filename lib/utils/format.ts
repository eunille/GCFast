// lib/utils/format.ts
// Layer 1 — DOMAIN: Date, currency, and string formatters (pure functions, no side effects)

export function formatCurrency(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

export function formatMonthName(month: number): string {
  return new Intl.DateTimeFormat("en-PH", { month: "long" }).format(
    new Date(2000, month - 1, 1)
  );
}

export function formatMonthShort(month: number): string {
  return new Intl.DateTimeFormat("en-PH", { month: "short" }).format(
    new Date(2000, month - 1, 1)
  );
}
