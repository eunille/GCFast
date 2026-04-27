// app/(member)/layout.tsx
// Member shell layout — wraps member-facing pages

"use client";

import { useRequireRole } from "@/features/auth/hooks/useRequireRole";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("MEMBER");

  if (isLoading) return null;

  return <>{children}</>;
}
