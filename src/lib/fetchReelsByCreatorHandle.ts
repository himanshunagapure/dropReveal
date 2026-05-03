import { supabase } from "@/lib/supabase";
import type { Reel } from "@/types/reel";
import type { ShopItem } from "@/types/shop";

function normalizeExternalUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function normalizeImageUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^data:/i.test(t)) return t;
  return normalizeExternalUrl(t);
}

function numericToPriceString(n: number | null | undefined): string | undefined {
  if (n == null || !Number.isFinite(Number(n))) return undefined;
  return String(n);
}

type ProductRow = {
  link: string | null;
  image_url: string | null;
  name: string | null;
  price: number | null;
  original_price: number | null;
  display_order: number | null;
};

type FileRow = {
  id: string;
  file_url: string;
  label: string | null;
};

function mapProductsToShopItems(products: ProductRow[] | null): ShopItem[] | undefined {
  if (!products?.length) return undefined;
  const sorted = [...products].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const items: ShopItem[] = [];
  for (const p of sorted) {
    const link = (p.link ?? "").trim();
    if (!link) continue;
    const item: ShopItem = { url: normalizeExternalUrl(link) };
    const img = (p.image_url ?? "").trim();
    if (img) item.image = normalizeImageUrl(img);
    const name = (p.name ?? "").trim();
    if (name) item.name = name;
    const pr = numericToPriceString(p.price);
    if (pr) item.price = pr;
    const op = numericToPriceString(p.original_price);
    if (op) item.originalPrice = op;
    items.push(item);
  }
  return items.length ? items : undefined;
}

type ReelRow = {
  id: string;
  created_at?: string;
  reel_link: string;
  title: string;
  prompt: string | null;
  thumbnail?: string | null;
  products: ProductRow[] | null;
  files: FileRow[] | null;
};

/** Newest reel first (last added appears at the top of the profile grid). */
function sortReelsNewestFirst(rows: ReelRow[]): ReelRow[] {
  return [...rows].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return b.id.localeCompare(a.id);
  });
}

/** Fetches reels (with nested products and files) for a public creator profile by `handle`. */
export async function fetchReelsByCreatorHandle(handle: string): Promise<Reel[]> {
  const h = handle.trim().toLowerCase();
  if (!h) throw new Error("Creator handle is required.");

  const { data: creator, error: creatorError } = await supabase
    .from("creators")
    .select("id")
    .eq("handle", h)
    .maybeSingle();

  if (creatorError) throw new Error(creatorError.message);
  if (!creator) {
    throw new Error(
      `No creator found for “${handle}”. Check the handle, or sign in with Google to create your profile.`
    );
  }

  const { data: rows, error: reelsError } = await supabase
    .from("reels")
    .select("*, products (*), files (*)")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (reelsError) throw new Error(reelsError.message);
  if (!rows?.length) return [];

  const ordered = sortReelsNewestFirst(rows as ReelRow[]);

  return ordered.map((row) => {
    const shop_items = mapProductsToShopItems(row.products);
    const reel: Reel = {
      id: row.id,
      reel_link: normalizeExternalUrl(row.reel_link),
      title: row.title,
      prompt: row.prompt ?? "",
    };
    const thumb = (row.thumbnail ?? "").trim();
    if (thumb) reel.thumbnail = normalizeImageUrl(thumb);
    if (shop_items?.length) reel.shop_items = shop_items;

    const fileRows = row.files?.filter((f) => (f.file_url ?? "").trim()) ?? [];
    if (fileRows.length) {
      reel.files = fileRows.map((f) => ({
        id: f.id,
        file_url: normalizeExternalUrl(f.file_url),
        ...(f.label?.trim() ? { label: f.label.trim() } : {}),
      }));
    }

    return reel;
  });
}
