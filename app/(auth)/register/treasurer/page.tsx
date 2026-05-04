// app/(auth)/register/treasurer/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer registration page.

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Treasurer Registration — GFAST-MPTS",
};

export default function TreasurerRegisterPage() {
  return <RegisterForm role="treasurer" />;
}
