import type { Reel } from "@/types/reel";
import type { ShopItem } from "@/types/shop";

export function shopItemsFromReel(reel: Reel): ShopItem[] {
  if (reel.shop_items?.length) return reel.shop_items;
  if (reel.shop_link) return [{ url: reel.shop_link }];
  return [];
}
