// components/common/EmptyState/EmptyState.tsx
// Layer 4 — PRESENTATIONAL: Empty state with message and optional action

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState(_props: Props) {
  return null;
}
