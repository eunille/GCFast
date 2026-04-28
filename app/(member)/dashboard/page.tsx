// Redirects to the canonical /member/dashboard URL
import { redirect } from "next/navigation";

export default function OldDashboardRedirect() {
  redirect("/member/dashboard");
}

