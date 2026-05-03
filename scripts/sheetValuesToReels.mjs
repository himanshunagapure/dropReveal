/**
 * Maps Google Sheets API `values` rows → reel-shaped objects (same rules as the former app sheet).
 * @param {string[][] | undefined} values
 * @returns {Array<{ id: string; reel_link: string; title: string; prompt: string; shop_link?: string; thumbnail?: string; shop_items?: Array<{ url: string; image?: string; name?: string; price?: string; originalPrice?: string }> }>}
 */
const REQUIRED = ["id", "reel_link", "prompt", "title"];

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeExternalUrl(raw) {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function normalizeImageUrl(raw) {
  const t = raw.trim();
  if (!t) return t;
  if (/^data:/i.test(t)) return t;
  return normalizeExternalUrl(t);
}

function headerIndexMap(headers, pattern) {
  const map = new Map();
  headers.forEach((h, i) => {
    const m = h.match(pattern);
    if (m) map.set(parseInt(m[1], 10), i);
  });
  return map;
}

function parseShopItemsFromRow(row, headers) {
  const linkMap = headerIndexMap(headers, /^link_?(\d+)$/);
  if (linkMap.size === 0) return undefined;

  const imageMap = headerIndexMap(headers, /^image_?(\d+)$/);
  const nameMap = headerIndexMap(headers, /^name_?(\d+)$/);
  const priceMap = headerIndexMap(headers, /^price_?(\d+)$/);
  const origMap = headerIndexMap(headers, /^original_price_?(\d+)$/);

  const indices = [...linkMap.keys()].sort((a, b) => a - b);
  const items = [];

  for (const n of indices) {
    const li = linkMap.get(n);
    const rawUrl = String(row[li] ?? "").trim();
    if (!rawUrl) continue;

    const item = { url: normalizeExternalUrl(rawUrl) };

    const ii = imageMap.get(n);
    if (ii !== undefined) {
      const img = String(row[ii] ?? "").trim();
      if (img) item.image = normalizeImageUrl(img);
    }
    const ni = nameMap.get(n);
    if (ni !== undefined) {
      const name = String(row[ni] ?? "").trim();
      if (name) item.name = name;
    }
    const pi = priceMap.get(n);
    if (pi !== undefined) {
      const price = String(row[pi] ?? "").trim();
      if (price) item.price = price;
    }
    const oi = origMap.get(n);
    if (oi !== undefined) {
      const op = String(row[oi] ?? "").trim();
      if (op) item.originalPrice = op;
    }

    items.push(item);
  }

  return items.length > 0 ? items : undefined;
}

const SHOP_COLUMN_ALIASES = [
  "shop_link",
  "clothes_prompt",
  "link",
  "url",
  "shop",
  "clothes_link",
  "product_link",
  "buy_link",
];

export function sheetValuesToReels(values) {
  if (!values?.length) return [];

  const headers = values[0].map(normalizeHeader);
  const col = (name) => headers.indexOf(name);

  for (const name of REQUIRED) {
    if (col(name) === -1) {
      throw new Error(
        `Sheet is missing required column "${name}". Found headers: ${headers.join(", ")}`
      );
    }
  }

  const iId = col("id");
  const iReel = col("reel_link");
  const iPrompt = col("prompt");
  const iTitle = col("title");

  let iShop = -1;
  for (const name of SHOP_COLUMN_ALIASES) {
    const j = col(name);
    if (j !== -1) {
      iShop = j;
      break;
    }
  }

  const THUMB_ALIASES = ["thumbnail", "thumbnail_url", "image", "poster", "cover"];
  let iThumb = -1;
  for (const name of THUMB_ALIASES) {
    const j = col(name);
    if (j !== -1) {
      iThumb = j;
      break;
    }
  }

  const reels = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const id = String(row[iId] ?? "").trim();
    const reel_link = String(row[iReel] ?? "").trim();
    const prompt = String(row[iPrompt] ?? "").trim();
    const title = String(row[iTitle] ?? "").trim();
    const shopRaw = iShop >= 0 ? String(row[iShop] ?? "").trim() : "";
    const thumbRaw = iThumb >= 0 ? String(row[iThumb] ?? "").trim() : "";

    if (!id || !reel_link) continue;

    const reel = {
      id,
      reel_link,
      title,
      prompt,
    };
    if (shopRaw) reel.shop_link = normalizeExternalUrl(shopRaw);
    if (thumbRaw) reel.thumbnail = normalizeImageUrl(thumbRaw);

    const shopItems = parseShopItemsFromRow(row, headers);
    if (shopItems?.length) reel.shop_items = shopItems;

    reels.push(reel);
  }

  reels.reverse();
  return reels;
}
