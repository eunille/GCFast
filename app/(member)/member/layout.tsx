// app/(member)/member/layout.tsx
// Member shell layout — guards all /member/* routes and renders AppShell

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, FileText } from "lucide-react";
import { useRequireRole } from "@/features/auth/hooks/useRequireRole";
import { AppShell } from "@/components/layout/AppShell";
import type { NavItem } from "@/components/layout/AppShell";

const MEMBER_NAV: NavItem[] = [
  { href: "/member/dashboard", label: "My Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/member/profile",   label: "My Profile",   icon: <User className="h-4 w-4" /> },
  { href: "/member/reports",   label: "Reports",      icon: <FileText className="h-4 w-4" /> },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useRequireRole("MEMBER");
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.accountStatus === "pending") {
      router.replace("/pending-approval");
    } else if (user.accountStatus === "rejected") {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;
  if (user?.accountStatus === "pending" || user?.accountStatus === "rejected") return null;

  return <AppShell navItems={MEMBER_NAV}>{children}</AppShell>;
}
