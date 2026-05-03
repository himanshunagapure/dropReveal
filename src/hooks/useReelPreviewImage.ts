import { useQuery } from "@tanstack/react-query";
import type { Reel } from "@/types/reel";
import { fetchLinkPreviewThumbnail } from "@/lib/fetchLinkPreviewThumbnail";

/** Uses sheet `thumbnail` when set; otherwise fetches a preview image for `reel_link` (cached per reel). */
export function useReelPreviewImage(reel: Reel) {
  return useQuery({
    queryKey: ["reel-preview-image", reel.id, reel.reel_link, reel.thumbnail],
    queryFn: () => fetchLinkPreviewThumbnail(reel.reel_link),
    enabled: !reel.thumbnail && Boolean(reel.reel_link?.trim()),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 8 * 24 * 60 * 60 * 1000,
  });
}
