import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Instagram } from "lucide-react";
import ReelThumbnail from "@/components/ReelThumbnail";
import { extractInstagramShortcode, getInstagramEmbedUrl } from "@/lib/instagramReel";
import { fetchLinkPreviewThumbnail } from "@/lib/fetchLinkPreviewThumbnail";
import { cn } from "@/lib/utils";

interface InstagramReelEmbedProps {
  reelUrl: string;
  title: string;
  /** From sheet `thumbnail` column when set */
  thumbnailUrl?: string;
  /** Reset playback when this changes (e.g. reel id). */
  resetKey?: string;
  className?: string;
}

/**
 * Static preview + play overlay; after play, inline Instagram embed iframe.
 * Falls back to “Open on Instagram” if the URL is not a parseable Instagram reel/post.
 */
const InstagramReelEmbed = ({
  reelUrl,
  title,
  thumbnailUrl: thumbnailFromSheet,
  resetKey,
  className,
}: InstagramReelEmbedProps) => {
  const [playing, setPlaying] = useState(false);
  const shortcode = extractInstagramShortcode(reelUrl);

  const { data: fetchedThumb, isLoading: thumbLoading } = useQuery({
    queryKey: ["reel-preview-image", resetKey, reelUrl, thumbnailFromSheet],
    queryFn: () => fetchLinkPreviewThumbnail(reelUrl),
    enabled: Boolean(reelUrl.trim()) && !thumbnailFromSheet,
    staleTime: 7 * 24 * 60 * 60 * 1000,
  });

  const posterUrl = thumbnailFromSheet ?? fetchedThumb ?? undefined;

  useEffect(() => {
    setPlaying(false);
  }, [resetKey, reelUrl]);

  if (!shortcode) {
    return (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-t-2xl bg-muted/80 px-6 py-12 text-center",
          className
        )}
      >
        <Instagram className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          Preview isn’t available for this link. Open it on Instagram to watch.
        </p>
        <a
          href={reelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Instagram className="h-4 w-4" />
          Open on Instagram
        </a>
      </div>
    );
  }

  const embedUrl = getInstagramEmbedUrl(shortcode);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-t-2xl bg-black", className)}>
      {!playing ? (
        <div className="relative aspect-[9/14] max-h-[55vh] w-full">
          <ReelThumbnail
            title={title}
            imageUrl={posterUrl}
            isLoading={!posterUrl && thumbLoading && !thumbnailFromSheet}
            className="h-full w-full transition-transform duration-500"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <Instagram className="h-3.5 w-3.5 text-white" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/90">
              Instagram
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group/play focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-t-2xl"
            aria-label="Play reel"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md transition-transform duration-200 group-hover/play:scale-110 group-active/play:scale-95">
              <span className="ml-1 inline-block w-0 h-0 border-l-[14px] border-l-white border-y-[9px] border-y-transparent" />
            </span>
          </button>
        </div>
      ) : (
        <div className="relative w-full bg-black" style={{ minHeight: "min(70vh, 734px)" }}>
          <iframe
            title={`Instagram reel: ${title}`}
            src={embedUrl}
            className="h-[min(70vh,734px)] w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default InstagramReelEmbed;
