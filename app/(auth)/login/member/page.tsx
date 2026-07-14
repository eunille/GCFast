// app/(auth)/login/member/page.tsx
// Member login page

import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Member Sign In — GCFAs",
};

export default function MemberLoginPage() {
  return <LoginForm />;
}