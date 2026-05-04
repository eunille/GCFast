// features/auth/components/LoginForm/LoginForm.tsx
// Layer 4 — PRESENTATIONAL: Email + password login form.

"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useSignIn } from "../../hooks/useSignIn";
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

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, error } = useSignIn();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await signIn(email, password);
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f9fafb] px-4">
      <Card className="w-full max-w-sm shadow-none">
        <CardHeader className="items-center text-center gap-2 pb-4">
          <Image
            src="/gcfast_logo.png"
            alt="GFAST"
            width={40}
            height={40}
            className="object-contain"
          />
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome to GFAC-ASS
          </CardTitle>
          <CardDescription>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-foreground font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Sign up
            </Link>
          </CardDescription>
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
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button asChild variant="outline" className="w-full font-medium">
            <Link href="/register">Register as Member</Link>
          </Button>
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
