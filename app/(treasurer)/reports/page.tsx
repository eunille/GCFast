// app/(treasurer)/reports/page.tsx
// Redirects to the canonical /treasurer/reports URL
import { redirect } from "next/navigation";

export default function OldReportsRedirect() {
  redirect("/treasurer/reports");
}

