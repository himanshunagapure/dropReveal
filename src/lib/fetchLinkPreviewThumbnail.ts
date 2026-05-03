/**
 * Resolves a preview image URL for a public page (e.g. Instagram reel).
 * Uses Microlink (https://microlink.io) — browser-safe CORS; Instagram og:image is not fetchable from the client.
 */
export async function fetchLinkPreviewThumbnail(pageUrl: string): Promise<string | null> {
  const trimmed = pageUrl.trim();
  if (!trimmed) return null;

  try {
    const api = new URL("https://api.microlink.io/");
    api.searchParams.set("url", trimmed);
    const key = import.meta.env.VITE_MICROLINK_API_KEY as string | undefined;
    if (key?.trim()) api.searchParams.set("apiKey", key.trim());

    const res = await fetch(api.toString());
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: { image?: { url?: string } };
    };
    const url = json.data?.image?.url;
    return typeof url === "string" && url.length > 0 ? url : null;
  } catch {
    return null;
  }
}
