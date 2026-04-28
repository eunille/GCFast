// features/auth/components/RegisterForm/RegisterForm.tsx
// Layer 4 — PRESENTATIONAL: Registration form for both roles.
// Calls useRegister (Layer 3). No direct Supabase calls. No business logic.

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRegister, type RegisterRole } from "../../hooks/useRegister";
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

interface Props {
  role: RegisterRole;
}

const ROLE_CONFIG = {
  treasurer: {
    title: "Treasurer Registration",
    description: "Create your treasurer account to manage membership payments.",
    badgeLabel: "TREASURER",
    badgeColor: colors.brand.primary,
    badgeBg: colors.brand.subtle,
    loginLabel: "Already have an account?",
    loginHref: "/login",
  },
  member: {
    title: "Member Registration",
    description: "Create your member account to track your dues and payments.",
    badgeLabel: "MEMBER",
    badgeColor: colors.status.paid,
    badgeBg: colors.status.paidBg,
    loginLabel: "Already have an account?",
    loginHref: "/login",
  },
} as const;

export function RegisterForm({ role }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const { register, isLoading, error } = useRegister(role);
  const config = ROLE_CONFIG[role];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConfirmError(null);

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    const result = await register(email, password, fullName);
    if (result.requiresEmailConfirmation) {
      setRegistered(true);
    }
  }

  // Email confirmation pending state
  if (registered) {
    return (
      <Card
        className="w-full max-w-md text-center"
        style={{ boxShadow: shadows.lg, borderRadius: radius.xl }}
      >
        <CardHeader>
          <div
            className="mx-auto mb-4 flex items-center justify-center w-14 h-14"
            style={{ background: colors.status.paidBg, borderRadius: radius.full }}
          >
            <span style={{ color: colors.status.paid, fontSize: typography.fontSize["2xl"] }}>✓</span>
          </div>
          <CardTitle
            style={{
              color: colors.brand.primary,
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            Check your email
          </CardTitle>
          <CardDescription style={{ color: colors.text.secondary }}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account, then sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="w-full"
            style={{
              background: colors.brand.primary,
              color: colors.surface.page,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            <Link href="/login">Go to Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full max-w-md"
      style={{ boxShadow: shadows.lg, borderRadius: radius.xl }}
    >
      <CardHeader className="text-center pb-2">
        {/* Brand mark */}
        <div
          className="mx-auto mb-3 flex items-center justify-center w-14 h-14"
          style={{ background: colors.brand.primary, borderRadius: radius.xl }}
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

        {/* Role badge */}
        <div className="flex justify-center mb-1">
          <span
            className="px-3 py-1 text-xs font-semibold tracking-wide uppercase"
            style={{
              background: config.badgeBg,
              color: config.badgeColor,
              borderRadius: radius.full,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {config.badgeLabel}
          </span>
        </div>

        <CardTitle
          style={{
            color: colors.brand.primary,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          {config.title}
        </CardTitle>
        <CardDescription
          style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
        >
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* API error */}
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

          {/* Full name */}
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              style={{
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.sm,
              }}
            >
              Full name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Maria Santos"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>

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
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              style={{
                color: colors.text.primary,
                fontWeight: typography.fontWeight.medium,
                fontSize: typography.fontSize.sm,
              }}
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {confirmError && (
              <p
                style={{
                  color: colors.status.outstanding,
                  fontSize: typography.fontSize.xs,
                }}
              >
                {confirmError}
              </p>
            )}
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
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <Separator className="my-4" />

        <p
          className="text-center"
          style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
        >
          {config.loginLabel}{" "}
          <Link
            href={config.loginHref}
            style={{
              color: colors.brand.accent,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
