// app/(member)/member/messages/page.tsx
// Layer 4 — PRESENTATIONAL: Member message/concern submission page (static/placeholder)

"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function MemberMessagesPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Placeholder submission logic
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast.info("Coming Soon", {
        description: "Message submission functionality will be available soon.",
      });
      
      // Reset form
      setSubject("");
      setMessage("");
    }, 500);
  };

  const isFormValid = subject.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Messages & Concerns
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Send a message or raise a concern to GCFAS officers
        </p>
      </div>

      {/* ── Info card ────────────────────────────────────────────────────── */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                How to reach us
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Use this form to send feedback, questions, or concerns to the GCFAS 
                officers. We'll respond to your message as soon as possible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Message form ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Send a Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Subject field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject <span className="text-destructive">*</span>
              </Label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your concern"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            {/* Message field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                placeholder="Describe your concern or question in detail..."
                rows={8}
                className="resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                {message.length} / 1000 characters
              </p>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* ── Contact info ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Alternative Contact Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <span className="font-medium text-foreground">Email:</span>{" "}
            <a href="mailto:gcfas@gordon.edu.ph" className="text-blue-600 hover:underline">
              gcfas@gordon.edu.ph
            </a>
          </p>
          <p>
            <span className="font-medium text-foreground">Office Hours:</span>{" "}
            Monday - Friday, 8:00 AM - 5:00 PM
          </p>
          <p>
            <span className="font-medium text-foreground">Location:</span>{" "}
            Faculty Center, 2nd Floor
          </p>
        </CardContent>
      </Card>

    </div>
  );
}