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

// CORS: in production, ALLOWED_ORIGIN env var MUST be set to your Vercel domain.
// Wildcard is only permitted in development. A missing env var in production fails fast.
function getAllowedOrigin(): string {
  const origin = process.env.ALLOWED_ORIGIN;
  if (!isDev && !origin) {
    throw new Error(
      "ALLOWED_ORIGIN environment variable is required in production. " +
      "Set it to your Vercel domain, e.g. https://your-app.vercel.app"
    );
  }
  return origin ?? "*"; // "*" only reachable in dev
}

const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: getAllowedOrigin() },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/:path*", headers: corsHeaders },
    ];
  },
};

export default nextConfig;
