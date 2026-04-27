// components/common/DataTable/DataTable.tsx
// Layer 4 — PRESENTATIONAL: Generic sortable data table scaffold

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>(_props: Props<T>) {
  return null;
}
