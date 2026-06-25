// app/page.tsx
// Root — redirects to login. Entry point for GCFASApp is /(auth)/login.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
