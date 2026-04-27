// components/layout/AppShell/AppShell.tsx
// Layer 4 — PRESENTATIONAL: Root layout wrapper (sidebar + topnav + main)

import type { NavItem } from "./Sidebar";

interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
}

export function AppShell({ children }: Props) {
  return <>{children}</>;
}
