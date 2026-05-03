import type { ShopItem } from "@/types/shop";

/** Workbook / PDF row from `files` in Supabase. */
export interface ReelFile {
  id: string;
  file_url: string;
  label?: string;
}

/** Reel card data: Supabase `reels` + optional `products`, `files`, thumbnail. */
export interface Reel {
  id: string;
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
}
