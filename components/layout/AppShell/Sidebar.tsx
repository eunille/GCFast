// components/layout/AppShell/Sidebar.tsx
// Layer 4 — PRESENTATIONAL: App sidebar navigation

export interface NavItem {
  href: string;
  label: string;
}

interface Props {
  navItems: NavItem[];
}

export function Sidebar(_props: Props) {
  return null;
}
