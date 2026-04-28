// components/layout/AppShell/Sidebar.tsx
// Layer 4 — PRESENTATIONAL: App sidebar navigation

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { colors, typography, radius } from "@/theme";

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
    <aside
      className="flex flex-col h-full w-64 shrink-0"
      style={{ background: colors.brand.primary }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.12)` }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 shrink-0"
          style={{
            background: colors.brand.accent,
            borderRadius: radius.lg,
          }}
        >
          <span
            style={{
              color: colors.surface.page,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            G
          </span>
        </div>
        <div>
          <p
            style={{
              color: colors.surface.page,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.bold,
              lineHeight: "1.2",
            }}
          >
            GFAST-MPTS
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: typography.fontSize.xs,
            }}
          >
            Payment Tracker
          </p>
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
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                background: isActive
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
                color: isActive
                  ? colors.surface.page
                  : "rgba(255,255,255,0.65)",
                fontWeight: isActive
                  ? typography.fontWeight.semibold
                  : typography.fontWeight.normal,
                borderRadius: radius.md,
                fontSize: typography.fontSize.sm,
              }}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator style={{ background: "rgba(255,255,255,0.12)" }} />

      {/* User + sign out */}
      <div className="px-4 py-4 space-y-3">
        {user && (
          <div className="px-2">
            <p
              style={{
                color: colors.surface.page,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}
              className="truncate"
            >
              {user.email}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: typography.fontSize.xs,
              }}
            >
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          style={{
            borderColor: "rgba(255,255,255,0.25)",
            color: colors.surface.page,
            background: "transparent",
            fontSize: typography.fontSize.sm,
          }}
          onClick={signOut}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
