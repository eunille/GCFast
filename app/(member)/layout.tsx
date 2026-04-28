// app/(member)/layout.tsx
// Outer route group layout — pass-through only.
// Role guard lives in app/(member)/member/layout.tsx

export default function MemberGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
