// components/layout/AppShell/Sidebar.tsx
// Layer 4 — PRESENTATIONAL: App sidebar navigation

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

export function Sidebar({ navItems }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { signOut } = useSignOut();

  return (
    <aside className="flex flex-col h-full w-64 shrink-0 bg-primary">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/12">
        <div className="flex items-center justify-center w-9 h-9 shrink-0 bg-accent rounded-lg">
          <span className="text-base font-bold text-white">G</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">GFAST-MPTS</p>
          <p className="text-xs text-white/55">Payment Tracker</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/65 hover:bg-white/10 hover:text-white/90"
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/12" />

      {/* User + sign out */}
      <div className="px-4 py-4 space-y-3">
        {user && (
          <div className="px-2">
            <p className="text-sm font-medium text-white truncate">
              {user.email}
            </p>
            <p className="text-xs text-white/55">
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-white/25 text-white bg-transparent hover:bg-white/10 hover:text-white text-sm"
          onClick={signOut}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
