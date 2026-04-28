// components/layout/AppShell/TopNav.tsx
// Layer 4 — PRESENTATIONAL: Top navigation bar (mobile hamburger + page title)

"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { colors, typography, shadows } from "@/theme";

interface Props {
  title?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function TopNav({ title, onMenuToggle, isMobileMenuOpen }: Props) {
  return (
    <header
      className="flex items-center gap-4 px-4 h-14 shrink-0 md:hidden"
      style={{
        background: colors.surface.page,
        boxShadow: shadows.sm,
        borderBottom: `1px solid ${colors.brand.subtle}`,
      }}
    >
      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        onClick={onMenuToggle}
        style={{ color: colors.brand.primary }}
      >
        {isMobileMenuOpen ? (
          // X icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          // Hamburger icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Page title */}
      {title && (
        <span
          style={{
            color: colors.brand.primary,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {title}
        </span>
      )}
    </header>
  );
}
