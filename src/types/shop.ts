/** One shoppable product row from the sheet (`linkN` + optional `imageN`, `nameN`, …). */
export interface ShopItem {
  url: string;
  image?: string;
  name?: string;
  /** Sale / current price as entered (e.g. `2304` or `₹2,304`). */
  price?: string;
  /** MRP / original price for strikethrough and discount %. */
  originalPrice?: string;
}
