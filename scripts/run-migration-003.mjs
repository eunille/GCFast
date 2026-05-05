/**
 * One-off script: apply migration 003 (account_status column) via Supabase REST.
 * Run: node scripts/run-migration-003.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "../.env");
const envLines = readFileSync(envPath, "utf8").replace(/\r/g, "").split("\n");
const env = {};
for (const line of envLines) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sql = `
DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('pending', 'active', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
`;

// Supabase exposes raw SQL via the Management REST API.
// Since we have a service role key but not a management token, we'll use the
// Postgres REST endpoint that Supabase exposes for service-role callers.
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ sql }),
});

if (res.ok) {
  console.log("✅ Migration 003 applied successfully.");
} else {
  const body = await res.text();
  // exec_sql likely doesn't exist — fall back to direct DDL via supabase-js
  if (res.status === 404 || body.includes("Could not find")) {
    console.log("exec_sql RPC not found. Trying direct ALTER via supabase-js admin...");
    await runViaSupabaseJs(sql);
  } else {
    console.error("❌ Failed:", res.status, body);
    process.exit(1);
  }
}

async function runViaSupabaseJs(sql) {
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Use the pg extension's exec if available
  const { error } = await admin.rpc("exec_sql", { sql });
  if (error) {
    console.error("❌ supabase-js rpc failed:", error.message);
    console.log("\nFallback: run this SQL manually in Supabase Dashboard → SQL Editor:\n");
    console.log(sql);
    process.exit(1);
  }
  console.log("✅ Migration 003 applied via supabase-js.");
}
