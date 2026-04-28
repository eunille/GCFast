// scripts/create-treasurer.mjs
// One-time script to create the initial Treasurer account in Supabase.
//
// Usage:
//   node scripts/create-treasurer.mjs <email> <password> "<full name>"
//
// Example:
//   node scripts/create-treasurer.mjs treasurer@school.edu Password123! "Maria Santos"
//
// Requirements:
//   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in
//     gcfast_frontend/.env (the app's env file).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Load .env manually (no dotenv dependency needed)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

let envVars = {};
try {
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    envVars[key] = val;
  }
} catch {
  console.error("❌  Could not read .env file at:", envPath);
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("    Make sure gcfast_frontend/.env is populated.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------
const [,, email, password, fullName] = process.argv;

if (!email || !password || !fullName) {
  console.error("Usage: node scripts/create-treasurer.mjs <email> <password> \"<full name>\"");
  console.error('Example: node scripts/create-treasurer.mjs admin@school.edu Password123! "Maria Santos"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("❌  Password must be at least 8 characters.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Create the user via Supabase Admin API
// ---------------------------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`\nCreating treasurer account…`);
console.log(`  Email    : ${email}`);
console.log(`  Full name: ${fullName}\n`);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,          // skip the confirmation email for dev setup
  user_metadata: {
    role: "treasurer",          // lowercase — matches user_role DB enum
    full_name: fullName,
  },
});

if (error) {
  console.error("❌  Failed to create user:", error.message);
  process.exit(1);
}

console.log("✅  Treasurer account created successfully!");
console.log(`    User ID : ${data.user.id}`);
console.log(`    Email   : ${data.user.email}`);
console.log(`\n    You can now sign in at http://localhost:3000/login\n`);
