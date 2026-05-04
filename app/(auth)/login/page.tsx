// app/(auth)/login/page.tsx
// Layer 4 — PRESENTATIONAL: Login page.

import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign in — GFAST-MPTS",
};

export default function LoginPage() {
  return <LoginForm />;
}

