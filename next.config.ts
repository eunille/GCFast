import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy:
// - 'unsafe-inline' and 'unsafe-eval' are restricted to dev only.
// - Production build uses a strict script-src that relies on Next.js nonces
//   (add nonce middleware in /middleware.ts when deploying to production).
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self'";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
    ].join("; "),
  },
];

// CORS: prefer ALLOWED_ORIGIN env var. Falls back to VERCEL_URL (auto-set by Vercel)
// then to "*" in development. In production both are acceptable — Vercel injects VERCEL_URL.
function getAllowedOrigin(): string {
  if (process.env.ALLOWED_ORIGIN) return process.env.ALLOWED_ORIGIN;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "*"; // dev only
}

const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: getAllowedOrigin() },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
];

const nextConfig: NextConfig = {
  // pdfkit and exceljs use Node.js built-ins (fs, stream, etc.) — exclude from bundler
  serverExternalPackages: ["pdfkit", "exceljs"],

  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/:path*", headers: corsHeaders },
    ];
  },
};

export default nextConfig;
