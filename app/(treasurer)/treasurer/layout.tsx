// app/(treasurer)/treasurer/layout.tsx
// Treasurer shell layout — guards all /treasurer/* routes and renders AppShell

"use client";

import { useRequireRole } from "@/features/auth/hooks/useRequireRole";
import { AppShell } from "@/components/layout/AppShell";
import type { NavItem } from "@/components/layout/AppShell";

const TREASURER_NAV: NavItem[] = [
  { href: "/treasurer/overview",  label: "Overview" },
  { href: "/treasurer/members",   label: "Members" },
  { href: "/treasurer/payments",  label: "Payments" },
  { href: "/treasurer/reports",   label: "Reports" },
];

export default function TreasurerLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("TREASURER");

  if (isLoading) return null;

  return <AppShell navItems={TREASURER_NAV}>{children}</AppShell>;
}
