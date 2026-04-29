// app/(treasurer)/treasurer/layout.tsx
// Treasurer shell layout — guards all /treasurer/* routes and renders AppShell

"use client";

import { LayoutDashboard, Users, CreditCard, FileText } from "lucide-react";
import { useRequireRole } from "@/features/auth/hooks/useRequireRole";
import { AppShell } from "@/components/layout/AppShell";
import type { NavItem } from "@/components/layout/AppShell";

const TREASURER_NAV: NavItem[] = [
  { href: "/treasurer/overview",  label: "Dashboard",  icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/treasurer/members",   label: "Members",    icon: <Users className="h-4 w-4" /> },
  { href: "/treasurer/payments",  label: "Payments",   icon: <CreditCard className="h-4 w-4" /> },
  { href: "/treasurer/reports",   label: "Reports",    icon: <FileText className="h-4 w-4" /> },
];

export default function TreasurerLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireRole("TREASURER");

  if (isLoading) return null;

  return <AppShell navItems={TREASURER_NAV}>{children}</AppShell>;
}
