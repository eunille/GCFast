// app/(auth)/register/page.tsx
// Layer 4 — PRESENTATIONAL: Member registration page.

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { colors } from "@/theme";

export const metadata = {
  title: "Register — GFAST-MPTS",
};

export default function MemberRegisterPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: colors.brand.subtle }}
    >
      <RegisterForm role="member" />
    </main>
  );
}
