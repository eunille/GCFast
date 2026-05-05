// app/(treasurer)/payments/page.tsx
// Redirects to the canonical /treasurer/payments URL
import { redirect } from "next/navigation";

export default function OldPaymentsRedirect() {
  redirect("/treasurer/payments");
}

