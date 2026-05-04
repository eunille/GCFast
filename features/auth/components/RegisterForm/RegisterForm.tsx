// features/auth/components/RegisterForm/RegisterForm.tsx
// Layer 4 — PRESENTATIONAL: Registration form for both roles.

"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRegister, type RegisterRole } from "../../hooks/useRegister";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  role: RegisterRole;
}

const ROLE_CONFIG = {
  treasurer: {
    badge: "Treasurer",
    badgeClass: "bg-blue-100 text-blue-700",
    loginHref: "/login",
  },
  member: {
    badge: "Member",
    badgeClass: "bg-emerald-100 text-emerald-700",
    loginHref: "/login",
  },
} as const;

export function RegisterForm({ role }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (result.requiresEmailConfirmation) setRegistered(true);
  }

  // ── Email confirmation pending ─────────────────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f9fafb] px-4">
        <Card className="w-full max-w-sm shadow-none">
          <CardContent className="flex flex-col items-center gap-6 text-center pt-8 pb-8">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Click it to activate your account.
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              <Link href="/login">Back to Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f9fafb] px-4 py-12">
      <Card className="w-full max-w-sm shadow-none">
        <CardHeader className="items-center text-center gap-2 pb-4">
          <Image
            src="/gcfast_logo.png"
            alt="GFAST"
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create an account
              </CardTitle>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${config.badgeClass}`}
              >
                {config.badge}
              </span>
            </div>
            <CardDescription>
              Already have an account?{" "}
              <Link
                href={config.loginHref}
                className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Sign in
              </Link>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {error && (
            <div
              className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmError && (
                <p className="text-xs text-destructive">{confirmError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-6 pt-2">
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By clicking continue, you agree to our{" "}
            <span className="underline underline-offset-4 cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-4 cursor-pointer hover:text-foreground transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
