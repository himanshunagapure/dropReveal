# DropReveal — End-to-End UX Design Guide (MVP)

> This document defines the complete user experience for DropReveal MVP: every page, every user type, every button, and what is intentionally left out.

---

## The Two Types of Users

| User | Who they are | Login required |
|---|---|---|
| **Viewer** | Someone who saw a reel and wants the resource | No |
| **Creator** | The person who owns the DropReveal account | Yes (Google) |

---

## The 4 Pages (MVP only)

| Route | Page | Who | Login |
|---|---|---|---|
| `/` | Landing page | Everyone | No |
| `/[handle]` | Creator public profile | Viewers | No |
| `/dashboard` | Creator dashboard | Creators | Yes |
| `/dashboard` → form | Add / edit reel | Creators | Yes |

---

## Entry Points

### 1. Landing page — `/`

**Audience:** Everyone  
**Purpose:** Explain what DropReveal is in one line. Convert creators to sign up.

**What's on this page:**
- One-line headline explaining the product
- "Sign in with Google" button (for creators)
- Optional: link to an example creator profile

---

### 2. Creator profile — `/[handle]`

**Audience:** Viewers (no login needed)  
**Purpose:** Let viewers find the reel they saw and access the resource.

**What's on this page:**
- Creator avatar, display name, bio, total reel count
- Search bar — search by keyword or paste reel ID, filters grid in real time
- Reel grid — cards showing thumbnail · title · tags (Prompt / Shop / Download)
- Clicking a card opens the Reel Modal

---

## Creator Journey — Step by Step

### Step 1 — First visit & sign up

1. Creator lands on `/`
2. Clicks **"Sign in with Google"**
3. Google popup appears → they pick their account → done
4. No form. No password. No manual sign up.
5. Supabase trigger auto-creates their `creators` row:
   - `handle` = email prefix (e.g. `john` from `john@gmail.com`)
   - `display_name` = Google account name
   - `avatar_url` = Google profile photo
6. Redirected to `/dashboard`

### Step 2 — Dashboard

**Route:** `/dashboard`  
**Access:** Login required — redirects to `/` if not signed in

**Header bar (always visible):**
- Their avatar + display name
- Their public link: `dropreveal.com/[handle]`
- "View my page" button → opens `/[handle]` in new tab
- "Sign out" link

**Main content:**
- **"+ Add reel"** button — always at the top, always visible
- List of all their reels, newest first
- Each reel row shows: title · reel link · tags (Prompt / Shop / Download) · **Edit** button · **Delete** button

### Step 3 — Adding a reel

Clicking "+ Add reel" opens a form (modal or inline). Three sections:

#### Section 1 — Reel info (required)
| Field | Notes |
|---|---|
| Instagram / TikTok reel link | Full URL |
| Title | Shown to viewers on the card |
| Prompt text | Optional — the AI prompt, paste directly |

#### Section 2 — Shop items (optional)
| Field | Notes |
|---|---|
| Product name | Shown under image |
| Product link | Where "Shop now" goes |
| Image URL | Product photo |
| Price | Current price |
| Original price | Shows strikethrough if set |

- "+ Add another product" link adds a new row (up to any number)
- Each product row has a remove button

#### Section 3 — File download (optional)
| Field | Notes |
|---|---|
| Upload file | PDF, xlsx, docx — goes to Supabase Storage |
| Button label | e.g. "Download Workbook", "Get the Template" |

**On save:**
- Reel appears immediately on the creator's public page `/[handle]`
- Reel card shows tags for whichever resources were added (Prompt / Shop / Download)

### Step 4 — Editing a reel

- Creator clicks **Edit** on any reel row in the dashboard
- Same form pre-filled with existing data
- Save updates the reel, Cancel discards changes

### Step 5 — Deleting a reel

- Creator clicks **Delete** → confirmation prompt → reel removed
- Removed from public page immediately

---

## Viewer Journey — Step by Step

### Step 1 — Arrive at creator profile

Viewer gets the link from the creator's Instagram bio, reel caption, or comment. They visit `dropreveal.com/[handle]`.

No login. No prompt. The page loads instantly.

### Step 2 — Find the reel

Two ways:
1. **Scroll the grid** — browse all reels, newest first
2. **Search** — type a keyword or paste the reel ID from Instagram/TikTok URL

Each card shows:
- Thumbnail (from reel or uploaded)
- Title
- Small tags: `Prompt` / `Shop` / `Download` — so viewer knows what's inside before clicking

### Step 3 — Open reel modal

Viewer clicks a card. Modal opens with:

| Section | Shown when |
|---|---|
| Instagram / TikTok embed (plays inline) | Always |
| **"Reveal Prompt"** button | Creator added a prompt |
| Shop items (image · name · price · "Shop now" link) | Creator added products |
| **Download** button with creator's label | Creator uploaded a file |

**Reveal Prompt flow:**
1. Viewer clicks "Reveal Prompt"
2. Prompt text appears
3. "Copy" button copies it to clipboard in one tap

**Shop flow:**
1. Viewer clicks "Shop now" on a product
2. Opens the product link in a new tab

**Download flow:**
1. Viewer clicks the download button
2. File downloads directly from Supabase Storage

---

## Reel Card — Tags Logic

| Tag shown | Condition |
|---|---|
| `Prompt` | `reels.prompt` is not empty |
| `Shop` | At least one row in `products` for this reel |
| `Download` | At least one row in `files` for this reel |

---

## Button Reference — Dashboard

| Button | Where | What it does |
|---|---|---|
| Sign in with Google | `/` and `/dashboard` (logged out) | Google OAuth → create/restore session |
| View my page | Dashboard header | Opens `/[handle]` in new tab |
| Sign out | Dashboard header | Clears session, returns to `/` |
| + Add reel | Dashboard top | Opens add reel form |
| Edit | Per reel row | Opens pre-filled edit form |
| Delete | Per reel row | Confirmation → removes reel + products + files |
| + Add another product | Inside reel form | Adds a new product row |
| Save | Reel form | Inserts / updates reel in Supabase |
| Cancel | Reel form | Discards changes, closes form |

## Button Reference — Viewer (public page)

| Button | Where | What it does |
|---|---|---|
| Search bar | Profile page top | Filters reel grid in real time |
| Reel card (click) | Grid | Opens reel modal |
| Reveal Prompt | Modal | Shows prompt text |
| Copy | Modal (after reveal) | Copies prompt to clipboard |
| Shop now | Modal — per product | Opens product link in new tab |
| Download [label] | Modal | Downloads file from Supabase Storage |
| Close / X | Modal | Closes modal, returns to grid |

---

## What Is Intentionally Not in MVP

| Feature | Reason excluded |
|---|---|
| Analytics / view counts | Nice to have — add after launch |
| Paid / gated content | Requires payment infrastructure |
| Creator tiers / pricing plans | Not needed until multiple creators |
| Email capture from viewers | Post-launch growth feature |
| Password-protected resources | Add when creators request it |
| Multiple handles per account | One creator = one handle for MVP |
| Creator-to-creator discovery | Not the core use case yet |
| Comment/DM automation | Out of scope — this replaces that need |

---

## Auth Flow Summary

```
Viewer visits /[handle]
  └── No login needed → page loads directly

Creator visits /
  └── Clicks "Sign in with Google"
       └── Google OAuth popup
            ├── First time → Supabase trigger creates creators row → /dashboard
            └── Returning  → Session restored → /dashboard

Creator visits /dashboard (not logged in)
  └── Redirect to / (or login page)
```

---

## Data Flow Summary

```
Creator adds reel via dashboard form
  └── Inserts into: reels table (creator_id, reel_link, title, prompt)
       ├── Inserts into: products table (reel_id, name, link, image_url, price, ...)
       └── Uploads to:  Supabase Storage → inserts URL into files table

Viewer visits /[handle]
  └── Supabase query: creators WHERE handle = [handle]
       └── Supabase query: reels + products + files WHERE creator_id = creator.id
            └── Renders reel grid → viewer clicks → modal shows resources
```

---

## Key Design Principles for MVP

1. **Viewers never log in** — zero friction for the audience
2. **One-click creator login** — Google OAuth only, no forms
3. **Creator owns their page** — one handle, one public URL, full control
4. **Resources are always free to access** — no paywalls at MVP
5. **Mobile-first** — most viewers will come from Instagram/TikTok on mobile
6. **No feature creep** — if it's not in this doc, it's post-MVP

---

*Last updated: May 2025 — DropReveal MVP*
