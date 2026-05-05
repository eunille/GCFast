// scripts/seed.mjs
// Populates GCFast with realistic sample data:
//   • 1 treasurer account
//   • 1 member account (linked to a member row)
//   • 9 colleges (all major departments)
//   • 12 academic periods for the current year
//   • Dues configurations
//   • 85+ members spread across all colleges / types
//   • Payment records covering every scenario:
//       – COMPLETE (all dues + membership fee paid)
//       – HAS_BALANCE – partial months paid
//       – HAS_BALANCE – only membership fee paid, no monthly dues
//       – HAS_BALANCE – no payments at all
//       – ASSOCIATE member (no membership fee required)
//
// Usage:
//   node scripts/seed.mjs
//
// Requirements:
//   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in gcfast_frontend/.env

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Load .env ────────────────────────────────────────────────────────────────

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
    envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
} catch {
  console.error("❌  Could not read .env at:", envPath);
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(label, data, error) {
  if (error) { console.error(`❌  ${label}:`, error.message); process.exit(1); }
  console.log(`✅  ${label}`);
  return data;
}

async function createAuthUser(email, password, fullName, role) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error && error.message.includes("already been registered")) {
    console.log(`⚠️   Auth user already exists: ${email}`);
    const { data: list } = await supabase.auth.admin.listUsers();
    return list.users.find((u) => u.email === email);
  }
  if (error) { console.error(`❌  createAuthUser(${email}):`, error.message); process.exit(1); }
  return data.user;
}

// ─── 1. Auth accounts ────────────────────────────────────────────────────────

console.log("\n── Creating auth accounts ──────────────────────────────────────");

const treasurerUser = await createAuthUser(
  "treasurer@gcfast.edu", "Treasurer@123", "Maria Santos", "treasurer"
);
console.log(`✅  Treasurer: treasurer@gcfast.edu / Treasurer@123  (id: ${treasurerUser.id})`);

// Member auth account — will be linked to a member row later
const memberAuthUser = await createAuthUser(
  "ashley@gcfast.edu", "Member@1234", "Ashley Reyes", "member"
);
console.log(`✅  Member   : ashley@gcfast.edu  / Member@1234   (id: ${memberAuthUser.id})`);

// ─── 2. Get treasurer profile id ─────────────────────────────────────────────

const { data: treasurerProfile } = await supabase
  .from("profiles")
  .select("id")
  .eq("id", treasurerUser.id)
  .single();

const recBy = treasurerProfile?.id ?? treasurerUser.id; // recorded_by FK

// ─── 3. Colleges ─────────────────────────────────────────────────────────────

console.log("\n── Seeding colleges ────────────────────────────────────────────");

const collegeRows = [
  { name: "College of Allied Health Studies",              code: "CAHS" },
  { name: "College of Business and Accountancy",           code: "CBA" },
  { name: "College of Computer Studies",                   code: "CCS" },
  { name: "College of Education, Arts and Sciences",       code: "CEAS" },
  { name: "College of Hospitality and Tourism Management", code: "CHTM" },
];

const { data: colleges, error: collegeErr } = await supabase
  .from("colleges")
  .upsert(collegeRows, { onConflict: "code" })
  .select("id, code");
ok("Colleges upserted", colleges, collegeErr);

/** Map code → id */
const cid = Object.fromEntries(colleges.map((c) => [c.code, c.id]));

// ─── 4. Academic periods ──────────────────────────────────────────────────────

console.log("\n── Seeding academic periods ────────────────────────────────────");

const YEAR = new Date().getFullYear();
const MONTH_LABELS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const periodRows = MONTH_LABELS.map((label, i) => ({
  month: i + 1,
  year: YEAR,
  label: `${label} ${YEAR}`,
}));

const { data: periods, error: periodErr } = await supabase
  .from("academic_periods")
  .upsert(periodRows, { onConflict: "month,year" })
  .select("id, month");
ok("Academic periods upserted", periods, periodErr);

/** Map month number → id */
const pid = Object.fromEntries(periods.map((p) => [p.month, p.id]));

// ─── 5. Dues configurations ───────────────────────────────────────────────────

console.log("\n── Seeding dues configurations ─────────────────────────────────");

const duesRows = [
  { payment_type: "MEMBERSHIP_FEE", member_type: "FULL_TIME",  amount: 200.00, effective_from: `${YEAR}-01-01` },
  { payment_type: "MONTHLY_DUES",   member_type: "FULL_TIME",  amount:  60.00, effective_from: `${YEAR}-01-01` },
  { payment_type: "MONTHLY_DUES",   member_type: "ASSOCIATE",  amount:  60.00, effective_from: `${YEAR}-01-01` },
];

const { error: duesErr } = await supabase
  .from("dues_configurations")
  .upsert(duesRows, { onConflict: "payment_type,member_type,effective_from" });
ok("Dues configurations upserted", true, duesErr);

// ─── 6. Members ───────────────────────────────────────────────────────────────

console.log("\n── Seeding members ─────────────────────────────────────────────");

// Build member list: ~10 per college, mix of FULL_TIME and ASSOCIATE
// Scenarios distributed:
//   SCENARIO_COMPLETE      – all periods paid + membership fee
//   SCENARIO_PARTIAL       – some months paid, membership fee paid
//   SCENARIO_FEE_ONLY      – only membership fee, no monthly dues
//   SCENARIO_NO_PAYMENT    – no payments at all
//   SCENARIO_ASSOCIATE_ALL – associate, all months paid
//   SCENARIO_ASSOCIATE_PART– associate, partial months
//   SCENARIO_ASSOCIATE_NONE– associate, no payments
//   SCENARIO_FT_NO_FEE_PARTIAL – full-time, no fee, partial months

const SCENARIOS = [
  "COMPLETE",          // FT: fee paid + all months paid
  "PARTIAL",           // FT: fee paid + months 1-4 only
  "FEE_ONLY",          // FT: fee paid, no monthly dues
  "NO_PAYMENT",        // FT: no payments at all
  "ASSOCIATE_ALL",     // Associate: all months paid
  "ASSOCIATE_PART",    // Associate: months 1-3 only
  "ASSOCIATE_NONE",    // Associate: no payments
  "FT_NO_FEE_PARTIAL", // FT: no membership fee, 3 months paid
  "COMPLETE",          // repeat COMPLETE for majority
  "PARTIAL",
];

const firstNames = [
  "Maria","Jose","Juan","Ana","Pedro","Rosa","Carlos","Elena","Luis","Sofia",
  "Miguel","Isabel","Antonio","Carmen","Fernando","Patricia","Roberto","Gloria",
  "Ricardo","Cristina","Eduardo","Marisol","Manuel","Lorena","Alberto","Cynthia",
  "Mario","Sandra","Ernesto","Michelle","Dennis","Sheila","Kevin","Joanna",
  "Mark","Celine","Jeffrey","Diane","Ryan","Jasmine","Kenneth","Mariel",
  "Renz","Katrina","Neil","Bianca","Aaron","Liza","Christian","Nikki",
  "Clifford","Jennifer","Jomer","Hazel","Leandro","Angelica","Arjay","Genesis",
  "Robbie","Faith","Vincent","Pamela","Philip","Grace","Francis","Theresa",
  "Bryan","Aileen","Jayson","Rosemarie","Eric","Maricel","Ian","Josephine",
  "Alvin","Rowena","Jay","Lynnette","Junmar","Glenda",
];

const lastNames = [
  "Santos","Reyes","Garcia","Cruz","Ramos","Torres","Flores","Dela Cruz",
  "Villanueva","Aquino","Perez","Mendoza","Lim","Tan","Gonzales","Hernandez",
  "Bautista","Castillo","Morales","Navarro","Ortega","Salazar","Abad","Delos Reyes",
  "Macaraeg","Buenaventura","Parungao","Evangelista","Catapang","Pagtalunan",
];

let memberIdx = 0;

/** @param {string} college college code
 *  @param {number} count how many members to create
 *  @param {string} [linkedProfileId] set on the first member of CCS (ashley's linked account)
 */
function buildMembersForCollege(collegeCode, count, linkedProfileId = null) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const scenario = SCENARIOS[memberIdx % SCENARIOS.length];
    const isAssociate = scenario.startsWith("ASSOCIATE");
    const fn = firstNames[memberIdx % firstNames.length];
    const ln = lastNames[memberIdx % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const empId = `EMP-${String(memberIdx + 1).padStart(4, "0")}`;
    const email = `member${memberIdx + 1}@gcfast.edu`;

    rows.push({
      college_id:   cid[collegeCode],
      employee_id:  empId,
      full_name:    fullName,
      email,
      member_type:  isAssociate ? "ASSOCIATE" : "FULL_TIME",
      joined_at:    `${YEAR}-01-15`,
      is_active:    true,
      created_by:   recBy,
      // Only the very first member (ashley) gets the linked profile
      profile_id:   memberIdx === 0 ? linkedProfileId : null,
    });
    memberIdx++;
  }
  return rows;
}

// ~10 members per college → 5 colleges → 50 total
const allMemberRows = [
  ...buildMembersForCollege("CCS",  10, memberAuthUser.id), // first row = ashley
  ...buildMembersForCollege("CAHS", 10),
  ...buildMembersForCollege("CBA",  10),
  ...buildMembersForCollege("CEAS", 10),
  ...buildMembersForCollege("CHTM", 10),
];

// Override ashley's name/email to match her auth account
allMemberRows[0].full_name = "Ashley Reyes";
allMemberRows[0].email     = "ashley@gcfast.edu";
allMemberRows[0].employee_id = "EMP-0001";

const { data: insertedMembers, error: memberErr } = await supabase
  .from("members")
  .upsert(allMemberRows, { onConflict: "email" })
  .select("id, email, member_type, full_name");
ok(`Members upserted (${insertedMembers.length})`, insertedMembers, memberErr);

// ─── 7. Payment records ───────────────────────────────────────────────────────

console.log("\n── Seeding payment records ─────────────────────────────────────");

const CURRENT_MONTH = new Date().getMonth() + 1; // 1-based
// Only create dues for months that have passed (≤ current month)
const passedMonths = Array.from({ length: CURRENT_MONTH }, (_, i) => i + 1);

const paymentRows = [];

insertedMembers.forEach((member, idx) => {
  const scenario = SCENARIOS[idx % SCENARIOS.length];
  const isFT     = member.member_type === "FULL_TIME";

  switch (scenario) {
    case "COMPLETE": {
      // Membership fee (FT only) + all passed months
      if (isFT) {
        paymentRows.push({
          member_id: member.id, payment_type: "MEMBERSHIP_FEE",
          amount_paid: 200.00, payment_date: `${YEAR}-01-20`,
          recorded_by: recBy,
        });
      }
      for (const m of passedMonths) {
        paymentRows.push({
          member_id: member.id, payment_type: "MONTHLY_DUES",
          academic_period_id: pid[m], amount_paid: 60.00,
          payment_date: `${YEAR}-${String(m).padStart(2, "0")}-25`,
          recorded_by: recBy,
        });
      }
      break;
    }
    case "PARTIAL": {
      // FT: fee paid + first 4 months only (or less if current month < 4)
      if (isFT) {
        paymentRows.push({
          member_id: member.id, payment_type: "MEMBERSHIP_FEE",
          amount_paid: 200.00, payment_date: `${YEAR}-01-20`,
          recorded_by: recBy,
        });
      }
      const paidMonths = passedMonths.slice(0, Math.min(4, passedMonths.length));
      for (const m of paidMonths) {
        paymentRows.push({
          member_id: member.id, payment_type: "MONTHLY_DUES",
          academic_period_id: pid[m], amount_paid: 60.00,
          payment_date: `${YEAR}-${String(m).padStart(2, "0")}-25`,
          recorded_by: recBy,
        });
      }
      break;
    }
    case "FEE_ONLY": {
      // FT: only membership fee, no monthly dues
      paymentRows.push({
        member_id: member.id, payment_type: "MEMBERSHIP_FEE",
        amount_paid: 200.00, payment_date: `${YEAR}-01-22`,
        recorded_by: recBy,
      });
      break;
    }
    case "NO_PAYMENT":
      // No payment records at all — worst case
      break;

    case "ASSOCIATE_ALL": {
      // Associate: all passed months
      for (const m of passedMonths) {
        paymentRows.push({
          member_id: member.id, payment_type: "MONTHLY_DUES",
          academic_period_id: pid[m], amount_paid: 60.00,
          payment_date: `${YEAR}-${String(m).padStart(2, "0")}-25`,
          recorded_by: recBy,
        });
      }
      break;
    }
    case "ASSOCIATE_PART": {
      // Associate: first 3 months
      const paidMonths = passedMonths.slice(0, Math.min(3, passedMonths.length));
      for (const m of paidMonths) {
        paymentRows.push({
          member_id: member.id, payment_type: "MONTHLY_DUES",
          academic_period_id: pid[m], amount_paid: 60.00,
          payment_date: `${YEAR}-${String(m).padStart(2, "0")}-25`,
          recorded_by: recBy,
        });
      }
      break;
    }
    case "ASSOCIATE_NONE":
      // No payments
      break;

    case "FT_NO_FEE_PARTIAL": {
      // FT: no membership fee, paid 3 months
      const paidMonths = passedMonths.slice(0, Math.min(3, passedMonths.length));
      for (const m of paidMonths) {
        paymentRows.push({
          member_id: member.id, payment_type: "MONTHLY_DUES",
          academic_period_id: pid[m], amount_paid: 60.00,
          payment_date: `${YEAR}-${String(m).padStart(2, "0")}-25`,
          recorded_by: recBy,
        });
      }
      break;
    }
  }
});

// Insert in batches of 100 to avoid request-size limits
const BATCH = 100;
let inserted = 0;
for (let i = 0; i < paymentRows.length; i += BATCH) {
  const batch = paymentRows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("payment_records")
    .upsert(batch, { onConflict: "member_id,payment_type,academic_period_id" });
  if (error) {
    // membership fee uniqueness constraint is per-member, not using the 3-column key
    // try insert without upsert for membership fee rows
    for (const row of batch) {
      if (row.payment_type === "MEMBERSHIP_FEE") {
        const { error: e2 } = await supabase
          .from("payment_records")
          .insert(row)
          .select();
        if (e2 && !e2.message.includes("duplicate")) {
          console.warn(`⚠️   Payment insert skipped (${row.member_id}):`, e2.message);
        }
      }
    }
    // re-insert only MONTHLY_DUES from this batch
    const duesOnly = batch.filter((r) => r.payment_type === "MONTHLY_DUES");
    if (duesOnly.length > 0) {
      const { error: e3 } = await supabase
        .from("payment_records")
        .upsert(duesOnly, { onConflict: "member_id,payment_type,academic_period_id" });
      if (e3) console.warn("⚠️   Dues batch upsert warning:", e3.message);
    }
  }
  inserted += batch.length;
}
console.log(`✅  Payment records inserted (~${inserted} rows attempted)`);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`
╔══════════════════════════════════════════════════════════╗
║                    SEED COMPLETE                         ║
╠══════════════════════════════════════════════════════════╣
║  Treasurer  :  treasurer@gcfast.edu  / Treasurer@123     ║
║  Member     :  ashley@gcfast.edu     / Member@1234       ║
╠══════════════════════════════════════════════════════════╣
║  Colleges   : ${String(collegeRows.length).padEnd(3)} (CAHS, CBA, CCS, CEAS, CHTM)           ║
║  Periods    : 12 months (${YEAR})                        ║
║  Members    : ${String(insertedMembers.length).padEnd(3)} across all colleges              ║
╠══════════════════════════════════════════════════════════╣
║  Scenarios covered:                                      ║
║   ✔  COMPLETE        – fee + all months paid             ║
║   ✔  PARTIAL         – fee paid, months 1-4 only         ║
║   ✔  FEE_ONLY        – membership fee, no dues           ║
║   ✔  NO_PAYMENT      – no payments at all                ║
║   ✔  ASSOCIATE_ALL   – associate, all months paid        ║
║   ✔  ASSOCIATE_PART  – associate, partial months         ║
║   ✔  ASSOCIATE_NONE  – associate, no payments            ║
║   ✔  FT_NO_FEE_PART  – FT, no fee, partial dues         ║
╚══════════════════════════════════════════════════════════╝
`);
