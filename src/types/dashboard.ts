/** Rows used on the creator dashboard (Supabase shapes). */

export type DashboardProduct = {
  id: string;
  reel_id: string;
  name: string | null;
  link: string | null;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  display_order: number | null;
};

export type DashboardFile = {
  id: string;
  reel_id: string;
  file_url: string;
  label: string | null;
};

export type DashboardReel = {
  id: string;
  creator_id: string;
  reel_link: string;
  title: string;
  prompt: string | null;
  /** Present after running `supabase/sql/001_reels_thumbnail.sql`. */
  thumbnail?: string | null;
  created_at: string;
  products: DashboardProduct[] | null;
  files: DashboardFile[] | null;
};
