// components/layout/AppShell/AppShell.tsx
// Layer 4 — PRESENTATIONAL: Root layout wrapper (sidebar + topnav + main content)

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, type NavItem } from "./Sidebar";
import { TopNav } from "./TopNav";
import { colors } from "@/theme";

interface Props {
  children: React.ReactNode;
  navItems: NavItem[];
}

/** Derive a page title from the last URL segment */
function getTitleFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppShell({ children, navItems }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: colors.surface.stripe }}>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:flex md:flex-col md:h-full">
        <Sidebar navItems={navItems} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-40 flex flex-col md:hidden">
            <Sidebar navItems={navItems} />
          </div>
        </>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <TopNav
          title={getTitleFromPath(pathname)}
          onMenuToggle={() => setMobileOpen((o) => !o)}
          isMobileMenuOpen={mobileOpen}
        />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: colors.surface.stripe }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
