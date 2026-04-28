// app/(auth)/register/treasurer/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer registration page.

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { colors } from "@/theme";

export const metadata = {
  title: "Treasurer Registration — GFAST-MPTS",
};

export default function TreasurerRegisterPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: colors.brand.subtle }}
    >
      <RegisterForm role="treasurer" />
    </main>
  );
}
