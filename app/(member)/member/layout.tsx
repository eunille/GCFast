// app/(member)/member/layout.tsx
// Member shell layout — guards all /member/* routes and renders AppShell

"use client";

import { useRequireRole } from "@/features/auth/hooks/useRequireRole";
import { AppShell } from "@/components/layout/AppShell";
import type { NavItem } from "@/components/layout/AppShell";

const MEMBER_NAV: NavItem[] = [
  { href: "/member/dashboard", label: "My Dashboard" },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("MEMBER");

  if (isLoading) return null;

  return <AppShell navItems={MEMBER_NAV}>{children}</AppShell>;
}
