// app/(auth)/pending-approval/page.tsx
// Shown to members whose account is pending treasurer approval.
// Polls /api/auth/me every 15 seconds and redirects to the dashboard once approved.

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Clock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authRepository } from "@/features/auth/repositories/auth.repository";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 15_000;

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const json = await res.json() as { data?: { accountStatus?: string } };
      if (json.data?.accountStatus === "active") {
        // Clear the poll interval before navigating
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.replace("/member/dashboard");
      }
    } catch {
      // Network error — silently retry on next poll
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      void checkStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkStatus]);

  async function handleSignOut() {
    await authRepository.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f9fafb] px-4">
      <Card className="w-full max-w-sm shadow-none">
        <CardContent className="flex flex-col items-center gap-6 text-center pt-8 pb-8">
          <Image
            src="/gcfast_logo.png"
            alt="GFAST"
            width={40}
            height={40}
            className="object-contain"
          />

          <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Pending Approval
            </h2>
            <p className="text-sm text-muted-foreground">
              Your account is awaiting approval from the Treasurer.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You will be able to access the system once your account has been
              activated. This page will update automatically when you are approved.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => void checkStatus()}
            disabled={isChecking}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking…" : "Check Status"}
          </Button>

          <Button variant="ghost" onClick={handleSignOut} className="w-full text-muted-foreground">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
