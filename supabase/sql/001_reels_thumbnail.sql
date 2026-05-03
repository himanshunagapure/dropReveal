-- Run once in Supabase SQL Editor (optional but recommended for dashboard + grid previews)
alter table public.reels add column if not exists thumbnail text;
