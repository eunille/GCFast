// features/auth/components/LoginForm/LoginForm.tsx
// Layer 4 — PRESENTATIONAL: Email + password login form.
// Calls useSignIn (Layer 3). No direct Supabase calls. No business logic.

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSignIn } from "../../hooks/useSignIn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { colors, typography, shadows, radius } from "@/theme";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading, error } = useSignIn();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await signIn(email, password);
  }

  return (
    <Card
      className="w-full max-w-md"
      style={{ boxShadow: shadows.lg, borderRadius: radius.xl }}
    >
      <CardHeader className="text-center pb-2">
        {/* Brand mark */}
        <div
          className="mx-auto mb-4 flex items-center justify-center w-14 h-14"
          style={{
            background: colors.brand.primary,
            borderRadius: radius.xl,
          }}
        >
          <span
            style={{
              color: colors.surface.page,
              fontSize: typography.fontSize["2xl"],
              fontWeight: typography.fontWeight.bold,
            }}
          >
            G
          </span>
        </div>

        <CardTitle
          style={{
            color: colors.brand.primary,
            fontSize: typography.fontSize["2xl"],
            fontWeight: typography.fontWeight.bold,
          }}
        >
          GFAST-MPTS
        </CardTitle>

        <CardDescription
          style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
          }}
        >
          Teacher Membership Payment Tracking System
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Error alert */}
          {error && (
            <div
              className="px-4 py-3 text-sm"
              role="alert"
              aria-live="polite"
              style={{
                background: colors.status.outstandingBg,
                color: colors.status.outstanding,
                borderRadius: radius.md,
                fontSize: typography.fontSize.sm,
              }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              style={{
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.sm,
              }}
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              style={{
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.sm,
              }}
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isLoading}
            style={{
              background: colors.brand.primary,
              color: colors.surface.page,
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.base,
            }}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <Separator className="my-4" />

        <div className="space-y-2 text-center">
          <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
            No account yet?{" "}
            <Link
              href="/register"
              style={{ color: colors.brand.accent, fontWeight: typography.fontWeight.medium }}
            >
              Register as Member
            </Link>
          </p>
          <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
            Setting up the system?{" "}
            <Link
              href="/register/treasurer"
              style={{ color: colors.brand.accent, fontWeight: typography.fontWeight.medium }}
            >
              Register as Treasurer
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

