// Redirects to the canonical /treasurer/overview URL
import { redirect } from "next/navigation";

export default function OldOverviewRedirect() {
  redirect("/treasurer/overview");
}

