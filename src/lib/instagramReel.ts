/** Shortcode from paths like /reel/ABC/, /p/ABC/, /tv/ABC/ */
export function extractInstagramShortcode(url: string): string | null {
  const s = url.trim();
  if (!s) return null;
  try {
    const withProto = s.startsWith("http") ? s : `https://${s}`;
    const u = new URL(withProto);
    if (!u.hostname.replace(/^www\./, "").includes("instagram.com")) return null;
    const m = u.pathname.match(/\/(?:reel|p|tv)\/([^/?#]+)/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Official embed URL — plays inside an iframe on your site. */
export function getInstagramEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/reel/${encodeURIComponent(shortcode)}/embed/?cr=1&v=14&wp=540`;
}
