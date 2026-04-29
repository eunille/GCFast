// components/layout/AppShell/Sidebar.tsx
// Layer 4 — PRESENTATIONAL: App sidebar navigation (shadcn Sidebar primitives)

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface Props {
  navItems: NavItem[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppSidebar({ navItems }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { signOut } = useSignOut();

  const displayName = user?.email?.split("@")[0] ?? "User";
  const roleLabel =
    user?.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
      : "";

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <SidebarHeader className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full  overflow-hidden">
            <Image
              src="/gcfast_logo.png"
              alt="GFAST"
              width={40}
              height={40}
              className="object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-sm font-bold text-white hidden fallback-visible">GC</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">
              GFAST-MPTS
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Treasurer Portal
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-10 gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        {item.icon && (
                          <span className="h-4 w-4 shrink-0">{item.icon}</span>
                        )}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: user + sign out ────────────────────────────────────────── */}
      <SidebarFooter className="px-3 py-3">
        <SidebarSeparator className="mb-3" />
        <div className="flex items-center gap-3 px-2">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold select-none">
            {getInitials(displayName)}
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate capitalize">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

