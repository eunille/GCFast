// app/(auth)/register/treasurer/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer registration page.

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Treasurer Registration — GCFAs App",
};

export default function TreasurerRegisterPage() {
  return <RegisterForm role="treasurer" />;
}
