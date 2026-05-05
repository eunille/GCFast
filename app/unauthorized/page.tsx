// app/unauthorized/page.tsx
// Shown when a user's role does not have access to the requested route.
// Server component — no hooks needed.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Access Denied — GFAST-MPTS",
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#D6E4F0] px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-lg rounded-xl">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <span className="text-red-500 text-2xl font-bold">✕</span>
          </div>

          <CardTitle className="text-[#1E3A5F] text-xl font-bold">
            Access Denied
          </CardTitle>

          <CardDescription className="text-muted-foreground text-sm">
            You don&apos;t have permission to view this page. Please contact
            your administrator if you believe this is a mistake.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Button asChild className="w-full font-semibold">
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
