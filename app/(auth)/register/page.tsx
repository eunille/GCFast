// app/(auth)/register/page.tsx
// Layer 4 — PRESENTATIONAL: Member registration page.

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Register — GFAST-MPTS",
};

export default function MemberRegisterPage() {
  return <RegisterForm role="member" />;
}
