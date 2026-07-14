// app/(auth)/login/treasurer/page.tsx
// Treasurer login page

import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Treasurer Sign In — GCFAs",
};

export default function TreasurerLoginPage() {
  return <LoginForm />;
}