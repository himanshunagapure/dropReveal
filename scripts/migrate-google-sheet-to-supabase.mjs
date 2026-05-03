#!/usr/bin/env node
/**
 * One-time migration: Google Sheet (Sheets API v4) → Supabase `reels` + `products`.
 *
 * Required env (e.g. in `.env`, loaded with `node --env-file=.env`):
 *   GOOGLE_SHEET_ID or VITE_GOOGLE_SHEET_ID
 *   GOOGLE_SHEETS_API_KEY or VITE_GOOGLE_SHEETS_API_KEY
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY — required: RLS only allows creators to insert their own rows;
 *     the service role bypasses RLS. Never expose this key in the browser or commit it.
 *   MIGRATION_CREATOR_ID — UUID from `creators.id` (must match the profile you want reels under)
 *
 * Optional:
 *   GOOGLE_SHEET_RANGE or VITE_GOOGLE_SHEET_RANGE (default: Sheet1!A:ZZ)
 *   MIGRATION_DRY_RUN=1 — fetch + parse only, no inserts
 *
 * Usage:
 *   npm run migrate:sheet
 */

import { createClient } from "@supabase/supabase-js";
import { sheetValuesToReels } from "./sheetValuesToReels.mjs";

function env(...names) {
  for (const n of names) {
    const v = process.env[n];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function parsePriceNumber(s) {
  if (s == null || s === "") return null;
  const n = parseFloat(String(s).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function fetchSheetValues() {
  const sheetId = env("GOOGLE_SHEET_ID", "VITE_GOOGLE_SHEET_ID");
  const apiKey = env("GOOGLE_SHEETS_API_KEY", "VITE_GOOGLE_SHEETS_API_KEY");
  const range = env("GOOGLE_SHEET_RANGE", "VITE_GOOGLE_SHEET_RANGE") || "Sheet1!A:ZZ";

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}`
  );
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Google Sheets API ${res.status}: ${t.slice(0, 400)}`);
  }
  const data = await res.json();
  return data.values;
}

function shopItemsForInsert(reel) {
  /** @type {Array<{ url: string; image?: string; name?: string; price?: string; originalPrice?: string }>} */
  let items = reel.shop_items?.length ? [...reel.shop_items] : [];
  if (items.length === 0 && reel.shop_link) {
    items = [{ url: reel.shop_link }];
  }
  return items;
}

async function main() {
  const dryRun = env("MIGRATION_DRY_RUN") === "1" || process.argv.includes("--dry-run");

  const sheetId = env("GOOGLE_SHEET_ID", "VITE_GOOGLE_SHEET_ID");
  const apiKey = env("GOOGLE_SHEETS_API_KEY", "VITE_GOOGLE_SHEETS_API_KEY");
  const supabaseUrl = env("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const creatorId = env("MIGRATION_CREATOR_ID");

  const missing = [];
  if (!sheetId) missing.push("GOOGLE_SHEET_ID (or VITE_GOOGLE_SHEET_ID)");
  if (!apiKey) missing.push("GOOGLE_SHEETS_API_KEY (or VITE_GOOGLE_SHEETS_API_KEY)");
  if (!dryRun && !supabaseUrl) missing.push("SUPABASE_URL (or VITE_SUPABASE_URL)");
  if (!dryRun && !serviceKey) {
    missing.push(
      "SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role; required for inserts past RLS)"
    );
  }
  if (!dryRun && !creatorId) missing.push("MIGRATION_CREATOR_ID (UUID from creators table)");

  if (missing.length) {
    throw new Error(`Missing environment variables:\n  - ${missing.join("\n  - ")}`);
  }

  console.log("Fetching Google Sheet…");
  const values = await fetchSheetValues();
  const reels = sheetValuesToReels(values);
  console.log(`Parsed ${reels.length} reel row(s) from the sheet.`);

  if (reels.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  if (dryRun) {
    console.log("MIGRATION_DRY_RUN=1 — skipping Supabase inserts.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inserted = 0;
  let skipped = 0;

  for (const reel of reels) {
    const { data: existing } = await supabase
      .from("reels")
      .select("id")
      .eq("creator_id", creatorId)
      .eq("reel_link", reel.reel_link)
      .maybeSingle();

    if (existing?.id) {
      console.log(`Skip (already exists): ${reel.title.slice(0, 60)}…`);
      skipped++;
      continue;
    }

    const { data: row, error: reelErr } = await supabase
      .from("reels")
      .insert({
        creator_id: creatorId,
        reel_link: reel.reel_link,
        title: reel.title,
        prompt: reel.prompt ?? "",
      })
      .select("id")
      .single();

    if (reelErr) {
      throw new Error(`reels insert failed: ${reelErr.message}`);
    }

    const reelId = row.id;
    const items = shopItemsForInsert(reel);

    if (items.length) {
      const productRows = items.map((p, i) => ({
        reel_id: reelId,
        name: p.name ?? null,
        link: p.url,
        image_url: p.image ?? null,
        price: parsePriceNumber(p.price),
        original_price: parsePriceNumber(p.originalPrice),
        display_order: i + 1,
      }));

      const { error: pErr } = await supabase.from("products").insert(productRows);
      if (pErr) throw new Error(`products insert failed: ${pErr.message}`);
    }

    console.log(`✓ ${reel.title}`);
    inserted++;
  }

  console.log(`\nDone. Inserted ${inserted} reel(s), skipped ${skipped} duplicate(s) by reel_link.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
