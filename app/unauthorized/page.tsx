// app/unauthorized/page.tsx
// Shown when a user's role does not have access to the requested route.
// Server component — no hooks needed.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { colors, typography, radius, shadows } from "@/theme";

export const metadata = {
  title: "Access Denied — GFAST-MPTS",
};

export default function UnauthorizedPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: colors.brand.subtle }}
    >
      <Card
        className="w-full max-w-md text-center"
        style={{ boxShadow: shadows.lg, borderRadius: radius.xl }}
      >
        <CardHeader className="pb-2">
          {/* Icon */}
          <div
            className="mx-auto mb-4 flex items-center justify-center w-16 h-16"
            style={{
              background: colors.status.outstandingBg,
              borderRadius: radius.full,
            }}
          >
            <span
              style={{
                color: colors.status.outstanding,
                fontSize: typography.fontSize["2xl"],
                fontWeight: typography.fontWeight.bold,
              }}
            >
              ✕
            </span>
          </div>

          <CardTitle
            style={{
              color: colors.brand.primary,
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            Access Denied
          </CardTitle>

          <CardDescription
            style={{
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
            }}
          >
            You don&apos;t have permission to view this page. Please contact
            your administrator if you believe this is a mistake.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Button
            asChild
            className="w-full"
            style={{
              background: colors.brand.primary,
              color: colors.surface.page,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
