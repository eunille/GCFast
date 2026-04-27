// app/(treasurer)/layout.tsx
// Treasurer shell layout — wraps all treasurer pages

"use client";

import { useRequireRole } from "@/features/auth/hooks/useRequireRole";

export default function TreasurerLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("TREASURER");

  if (isLoading) return null;

  return <>{children}</>;
}
