// app/(auth)/login/page.tsx
// Layer 4 — PRESENTATIONAL: Login page. Server component — renders LoginForm client component.

import { LoginForm } from "@/features/auth/components/LoginForm";
import { colors } from "@/theme";

export const metadata = {
  title: "Sign in — GFAST-MPTS",
};

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: colors.brand.subtle }}
    >
      <LoginForm />
    </main>
  );
}

