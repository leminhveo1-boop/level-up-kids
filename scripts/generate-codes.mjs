#!/usr/bin/env node
/**
 * Generate premium activation codes (admin tool — run locally, never ship).
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-codes.mjs [count] [durationDays]
 * Example: node scripts/generate-codes.mjs 10 365
 */
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

const count = parseInt(process.argv[2] || "5", 10);
const durationDays = parseInt(process.argv[3] || "365", 10);

// Unambiguous alphabet (no 0/O/1/I)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const segment = (len) =>
  Array.from(crypto.randomBytes(len))
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join("");

const supabase = createClient(url, key, { auth: { persistSession: false } });

const codes = Array.from({ length: count }, () => ({
  code: `LUKID-${segment(4)}-${segment(4)}`,
  plan: "premium",
  duration_days: durationDays,
  note: `batch ${new Date().toISOString().slice(0, 10)}`,
}));

const { error } = await supabase.from("activation_codes").insert(codes);
if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log(`Generated ${count} codes (${durationDays} days each):`);
for (const c of codes) console.log("  " + c.code);
