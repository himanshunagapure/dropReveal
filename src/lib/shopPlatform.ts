export interface ShopPlatformInfo {
  id: string;
  name: string;
  /** CSS color (hex) for badge background tint */
  color: string;
}

const KNOWN_PLATFORMS: Array<{
  test: (u: string) => boolean;
  info: ShopPlatformInfo;
}> = [
  {
    test: (u) => u.includes("myntra.com"),
    info: { id: "myntra", name: "Myntra", color: "#FF3F6C" },
  },
  {
    test: (u) => u.includes("amazon.") || u.includes("amzn."),
    info: { id: "amazon", name: "Amazon", color: "#FF9900" },
  },
  {
    test: (u) => u.includes("flipkart.com"),
    info: { id: "flipkart", name: "Flipkart", color: "#2874F0" },
  },
  {
    test: (u) => u.includes("meesho.com"),
    info: { id: "meesho", name: "Meesho", color: "#9B2D8E" },
  },
  {
    test: (u) => u.includes("nykaa.com"),
    info: { id: "nykaa", name: "Nykaa", color: "#FC2779" },
  },
  {
    test: (u) => u.includes("ajio.com"),
    info: { id: "ajio", name: "Ajio", color: "#2C4152" },
  },
];

/**
 * Derives a display name and stable id from an arbitrary URL's hostname.
 *
 * Strategy (in order):
 *  1. Strip well-known noise TLDs (.com, .in, .co.uk, etc.) and prefixes (www, shop, store, …).
 *  2. Take the leftmost meaningful label of the hostname.
 *  3. Title-case it.
 *
 * Examples:
 *   https://www.shopsy.in/…        → { id: "shopsy",   name: "Shopsy" }
 *   https://store.puma.com/…       → { id: "puma",     name: "Puma"   }
 *   https://www.tatacliq.com/…     → { id: "tatacliq", name: "Tatacliq" }
 *   https://shop.lenskart.com/…    → { id: "lenskart", name: "Lenskart" }
 */
function extractFromUrl(url: string): ShopPlatformInfo {
  const FALLBACK: ShopPlatformInfo = {
    id: "shop",
    name: "Shop",
    color: "#CC8A3D",
  };

  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return FALLBACK;
  }

  // Remove port if present
  hostname = hostname.split(":")[0];

  // Split into labels: ["www", "shop", "lenskart", "com"]
  const labels = hostname.split(".");

  // Known noise prefixes to skip (subdomain level)
  const NOISE_PREFIXES = new Set([
    "www", "www2", "www3",
    "shop", "store", "buy", "m",
    "app", "web", "go", "in",
  ]);

  // Known TLD-like suffixes to strip from the right
  // Covers simple TLDs and second-level TLDs like co.uk, co.in, com.au
  const NOISE_SUFFIXES = new Set([
    "com", "net", "org", "io", "co", "in", "uk", "us",
    "au", "de", "fr", "ae", "sg", "pk", "bd",
    "gov", "edu", "info", "biz",
  ]);

  // Drop TLD labels from the right
  while (labels.length > 1 && NOISE_SUFFIXES.has(labels[labels.length - 1])) {
    labels.pop();
  }

  // Drop noise prefix labels from the left
  while (labels.length > 1 && NOISE_PREFIXES.has(labels[0])) {
    labels.shift();
  }

  const core = labels[0]; // e.g. "lenskart", "tatacliq", "puma"
  if (!core) return FALLBACK;

  const name = core.charAt(0).toUpperCase() + core.slice(1); // simple title-case
  return { id: core, name, color: "#CC8A3D" };
}

export function detectShopPlatform(url: string): ShopPlatformInfo {
  const u = url.toLowerCase();

  for (const platform of KNOWN_PLATFORMS) {
    if (platform.test(u)) return platform.info;
  }

  return extractFromUrl(url);
}