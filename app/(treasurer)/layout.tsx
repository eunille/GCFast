// app/(treasurer)/layout.tsx
// Outer route group layout — pass-through only.
// Role guard lives in app/(treasurer)/treasurer/layout.tsx

export default function TreasurerGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
