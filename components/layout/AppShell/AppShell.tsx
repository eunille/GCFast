// components/layout/AppShell/AppShell.tsx
// Layer 4 — PRESENTATIONAL: Root layout wrapper (sidebar + topnav + main content)

"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "./Sidebar";
import { Separator } from "@/components/ui/separator";

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
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return (
    <SidebarProvider>
      {/* Sidebar — position:fixed panel + in-flow spacer handled by shadcn */}
      <AppSidebar navItems={navItems} />

      {/* Main area — flex-1 takes remaining space after the sidebar spacer */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-muted">
        {/* Top bar */}
        <header className="flex items-center gap-3 h-14 px-4 shrink-0 bg-background border-b border-border">
          <SidebarTrigger className="text-muted-foreground" />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-base font-semibold text-primary">{title}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-white">{children}</main>
      </div>
    </SidebarProvider>
  );
}

