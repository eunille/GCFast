// app/(member)/member/accomplishment/page.tsx
// Member accomplishment page

"use client";

export default function AccomplishmentPage() {
  return (
    <div className="-m-6 p-6 min-h-full bg-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Accomplishment</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          View and track your accomplishments
        </p>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-center min-h-48">
        <p className="text-sm font-medium text-muted-foreground">
          Accomplishment tracking coming soon
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This feature is under development
        </p>
      </div>
    </div>
  );
}