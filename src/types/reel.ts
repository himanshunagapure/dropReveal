import type { ShopItem } from "@/types/shop";

/** Workbook / PDF row from `files` in Supabase. */
export interface ReelFile {
  id: string;
  file_url: string;
  label?: string;
}

export type UnlockType = "free" | "password" | "paid";

/** Reel card data: Supabase `reels` + optional `products`, `files`, thumbnail. */
export interface Reel {
  id: string;
  creator_id: string;
  reel_link: string;
  title: string;
  /** Shown when the user taps Reveal Prompt; copied with Copy. */
  prompt: string;
  /** Legacy single shop URL — optional. */
  shop_link?: string;
  /** Products from Supabase `products` (or legacy sheet `linkN` columns). */
  shop_items?: ShopItem[];
  /** Card/modal poster image URL — optional; otherwise a preview is fetched when possible. */
  thumbnail?: string;
  /** Downloads from Supabase `files`. */
  files?: ReelFile[];
  /** Unlock mode — 'free' | 'password' | 'paid'. Defaults to 'free'. */
  unlock_type?: UnlockType;
  /** Price in INR for paid unlock (e.g. 99). */
  unlock_price_inr?: number | null;
  /** Hint shown to viewer before they unlock (e.g. "Check my story for the password"). */
  unlock_note?: string | null;
  /** Whether the creator is on the Pro plan (lower commission rate). */
  creator_is_pro?: boolean;
}
