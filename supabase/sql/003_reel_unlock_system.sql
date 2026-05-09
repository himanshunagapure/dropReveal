-- ─────────────────────────────────────────────────────────────────────────────
-- 003_reel_unlock_system.sql
-- Reel Unlock System — run once against your Supabase project
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Extend reels table ─────────────────────────────────────────────────────

alter table reels
  add column if not exists unlock_type text not null default 'free'
    check (unlock_type in ('free', 'password', 'paid')),
  add column if not exists unlock_password text,        -- bcrypt hash, never sent to frontend
  add column if not exists unlock_price_inr numeric,    -- e.g. 49, 99, 199
  add column if not exists unlock_note text;            -- hint shown to viewer before unlocking

-- ── 2. Extend creators table ──────────────────────────────────────────────────

alter table creators
  add column if not exists razorpay_contact_id text,
  add column if not exists razorpay_fund_account_id text,
  add column if not exists payouts_enabled boolean default false,
  add column if not exists is_pro boolean default false;

-- ── 3. Create reel_unlocks table ──────────────────────────────────────────────

create table if not exists reel_unlocks (
  id                   uuid primary key default gen_random_uuid(),
  reel_id              uuid references reels(id) on delete cascade,
  viewer_email         text,              -- from Razorpay payment.email (paid unlocks)
  viewer_phone         text,              -- from Razorpay payment.contact (paid unlocks)
  viewer_identifier    text,             -- sha256 hash of payment_id (fallback identifier)
  unlock_type          text not null,    -- 'paid' | 'password' | 'free'
  razorpay_payment_id  text,             -- only for paid unlocks
  drop_token           text,             -- token issued by FastAPI drop_service
  amount_paid_inr      numeric,
  created_at           timestamptz default now()
);

-- Fast lookups for restore-access flow and analytics
create index if not exists reel_unlocks_reel_email_idx
  on reel_unlocks(reel_id, viewer_email);

create index if not exists reel_unlocks_reel_identifier_idx
  on reel_unlocks(reel_id, viewer_identifier);

-- ── 4. Row Level Security for reel_unlocks ────────────────────────────────────

alter table reel_unlocks enable row level security;

-- Creators can read unlock analytics for their own reels
create policy if not exists "creator reads own reel unlocks"
  on reel_unlocks for select
  using (
    reel_id in (select id from reels where creator_id = auth.uid())
  );

-- Server-side inserts only (FastAPI uses the service role key, never the anon key)
create policy if not exists "server can insert unlock"
  on reel_unlocks for insert
  with check (true);

-- ── 5. Also update your SQLite / Postgres orders table (FastAPI side) ─────────
--    Run these against the database your FastAPI app connects to (may be the
--    same Supabase Postgres or a separate SQLite file for local dev):
--
   ALTER TABLE orders ADD COLUMN IF NOT EXISTS reel_id VARCHAR;
   ALTER TABLE orders ADD COLUMN IF NOT EXISTS creator_id VARCHAR;
   ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_rate FLOAT;
