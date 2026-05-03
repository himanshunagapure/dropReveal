# DropReveal

Creators host everything they mention in their reels—**reveal text** (prompts / instructions), **shop products**, and **workbook downloads**—on one public profile. Viewers open `/{handle}`, search or scroll, open a reel, and get resources without DMs.

The app is a **Vite + React** SPA backed by **Supabase** (Postgres, Auth, Storage). **Google Sheets is not used at runtime.**

---

## Implemented features (end-to-end)

### 1. Backend: Supabase

| Table | Role |
|-------|------|
| **`creators`** | One row per creator (`id` = `auth.users.id`), `handle`, `email`, `display_name`, `avatar_url`, `bio`, etc. |
| **`reels`** | Per-reel card: `reel_link`, `title`, `prompt`, `creator_id`, timestamps; optional **`thumbnail`** (see SQL below). |
| **`products`** | Shop rows per reel: `link`, `name`, `image_url`, `price`, `original_price`, `display_order`. |
| **`files`** | Downloads per reel: `file_url`, `label` (public URLs from Storage). |

- **RLS** (configured in Supabase): public **read** on creators / reels / products / files for public pages; creators **write** only their own rows (see `supabase-plan.txt` in the repo for the intended policy shape).
- **Auth**: Google OAuth via Supabase; **`on_auth_user_created`** trigger + `handle_new_user` assumed to insert **`creators`** on first sign-up.

### 2. Environment & client

- **`src/lib/supabase.ts`** — browser Supabase client; reads `VITE_SUPABASE_URL` / `SUPABASE_URL` and anon / publishable keys.
- **`vite.config.ts`** — `envPrefix: ["VITE_", "SUPABASE_"]` so both naming styles work from `.env`.
- **`.env.example`** — template for app + migration variables. **`.gitignore`** — keeps `.env` out of git (with `!.env.example` if present).

### 3. Routing (`src/App.tsx`)

| Path | Page |
|------|------|
| **`/`** | **Landing** (`CreatorHome`) — DropReveal marketing, features, **Sign in with Google** → `/dashboard`, optional “See an example” if `VITE_DEFAULT_CREATOR_HANDLE` is set. |
| **`/dashboard`** | **Creator dashboard** — requires session; unauthenticated users are redirected to `/`. |
| **`/{handle}`** | **Public creator profile** (`Index`) — avatar, name, handle, bio, search, reel grid. |
| **`/about`**, **`/contact`**, **`/how-it-works`**, **`/privacy`**, **`/terms`** | Static content pages (`StaticPageLayout` + copy from the project’s `.txt` sources). |
| **`*`** | 404 (`NotFound`). |

Static routes are registered **above** the `/:handle` catch-all so paths like `/about` are not treated as handles.

### 4. Public experience

- **`src/lib/fetchCreatorProfile.ts`** — loads creator row by normalized `handle` for the profile header.
- **`src/lib/fetchReelsByCreatorHandle.ts`** — loads reels with nested `products` and `files`, maps to app **`Reel`** types; **newest reels first** (sort by `created_at` desc, stable tie-break on `id`).
- **`Index.tsx`** — profile header, inline search (title / prompt / id), grid of **`ReelCard`**.
- **`ReelCard.tsx`** — full-card open to modal; thumbnail; tags for Prompt / Shop / Download when present.
- **`ReelModal.tsx`** — conditional sections: reveal text, horizontal product strip, file download buttons; Instagram embed + “Open on Instagram”; Escape to close.
- **`SiteFooter`** — links to About, How it works, Contact, Privacy, Terms; used on landing, public profile, and dashboard.

### 5. Creator dashboard

- **`Dashboard.tsx`** — session gate; sticky header with avatar, display name, public `/{handle}` link, **View my page**, **Sign out**; loads creator row for handle display.
- **`CreatorReelsManager.tsx`** — “Your reels”, **Add reel**, list rows with resource tags (Prompt, Shop · *n*, Download · *n*), **Edit** / **Delete** (with confirm).
- **`ReelEditorDialog.tsx`** — single flow for **Add** and **Edit**:
  - Fields: **URL link** (any URL, not only Instagram), **Title**, optional **Thumbnail image URL**, **Reveal text** (optional via toggle).
  - **Toggles**: Reveal text, Shop products, Workbook / download — sections show/hide accordingly.
  - **Shop & files are staged locally** until **Save reel** / **Add reel** — no per-row “Save product” that bypasses the main save.
  - **Save behaviour**: core reel row is written first; products use **differential sync** (delete removed DB rows by id, insert only new rows); new files are uploaded to **`workbooks`** then inserted into **`files`** with **`.select()`** so silent RLS failures surface as warnings.
  - **In-progress product form**: if **Link** is filled but the user did not click **Add to list**, that row is still included on save.
  - **Thumbnail column missing**: save retries without `thumbnail` and toasts a hint to run `001_reels_thumbnail.sql`.
  - **Dialog layout**: flex column with a **scrollable body** and **fixed footer** (Cancel / Save always visible); `min-w-0` / constrained width to avoid horizontal scroll clipping.

> **Note:** `DashboardProductsSection` / `DashboardFilesSection` still exist in the repo for reference but the reel editor uses the unified dialog flow above.

### 6. Storage (workbooks)

- Bucket name: **`workbooks`** (public read for viewers).
- **`src/lib/workbookStorage.ts`** — bucket constant, path helpers, filename sanitization.
- **`supabase/sql/002_workbooks_storage.sql`** — bucket + RLS for uploads under `{auth.uid()}/…` (re-run safe; includes `DROP POLICY IF EXISTS` — Supabase may warn about “destructive” operations; that is expected).

### 7. One-time migration: Google Sheet → Supabase

- **`scripts/sheetValuesToReels.mjs`** — Parses Sheets `values` like the legacy app (`id`, `reel_link`, `prompt`, `title`, optional `linkN` / shop columns, thumbnail aliases).
- **`scripts/migrate-google-sheet-to-supabase.mjs`** — Sheets API v4 → Supabase **`reels`** / **`products`**; skips existing `creator_id` + `reel_link`; uses **service role** (never in the browser).
- **`npm run migrate:sheet`** — `node --env-file=.env scripts/migrate-google-sheet-to-supabase.mjs`.

### 8. SQL snippets in repo

| File | Purpose |
|------|---------|
| **`supabase/sql/001_reels_thumbnail.sql`** | `alter table public.reels add column if not exists thumbnail text;` |
| **`supabase/sql/002_workbooks_storage.sql`** | `workbooks` bucket + storage policies for creator uploads. |

### 9. Branding & meta

- **`index.html`** — DropReveal title and social/meta description tuned for the product.

---

## Environment variables

### App (browser-safe)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` or `VITE_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`, or `VITE_SUPABASE_ANON_KEY` | Public key for the SPA |
| `VITE_DEFAULT_CREATOR_HANDLE` (optional) | If set, landing “See an example” can link to this handle |
| `VITE_MICROLINK_API_KEY` (optional) | Thumbnail previews when `reels.thumbnail` is empty |

### Migration only (local machine; never ship to client)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEET_ID` / `VITE_GOOGLE_SHEET_ID` | Spreadsheet ID |
| `GOOGLE_SHEETS_API_KEY` / `VITE_GOOGLE_SHEETS_API_KEY` | API key with Sheets API enabled |
| `GOOGLE_SHEET_RANGE` / `VITE_GOOGLE_SHEET_RANGE` (optional) | A1 range, default `Sheet1!A:ZZ` |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS for bulk insert |
| `MIGRATION_CREATOR_ID` | `creators.id` UUID that owns imported reels |
| `MIGRATION_DRY_RUN=1` or `--dry-run` | Parse only; no writes |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run migrate:sheet` | Google Sheet → Supabase migration |

---

## Supabase checklist (outside this repo)

1. Enable **Google** provider; set site URL + redirect URLs (e.g. `http://localhost:5173`, production origin) for OAuth return to **`/dashboard`**.
2. Tables + **RLS** + **`on_auth_user_created`** trigger aligned with your plan (see `supabase-plan.txt`).
3. Run **`001_reels_thumbnail.sql`** if you want dashboard thumbnail URLs.
4. Create public **`workbooks`** bucket, then run **`002_workbooks_storage.sql`**.

---

## Summary

**DropReveal** is a Supabase-backed creator tool: **landing** and **static pages**, **Google sign-in**, **public profile** at `/{handle}` with search and reel cards, **modal** with conditional reveal / shop / downloads, and a **dashboard** to manage reels end-to-end in **`ReelEditorDialog`** (unified save, storage uploads, RLS-aware inserts). Legacy **Google Sheets** data can be imported once via **`migrate:sheet`** using the **service role** key on a trusted machine only.
