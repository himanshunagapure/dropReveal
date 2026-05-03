import { Sparkles, ShoppingBag, Download, Instagram } from "lucide-react";
import type { Reel } from "@/types/reel";
import ReelThumbnail from "@/components/ReelThumbnail";
import { useReelPreviewImage } from "@/hooks/useReelPreviewImage";
import { shopItemsFromReel } from "@/lib/shopItemsFromReel";
import { cn } from "@/lib/utils";

interface ReelCardProps {
  reel: Reel;
  index: number;
  onOpenModal: (reel: Reel) => void;
}

/** Small pill badge shown on the card so viewers know what resources are inside. */
function ResourceTag({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm",
        className
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

const ReelCard = ({ reel, index, onOpenModal }: ReelCardProps) => {
  const { data: previewUrl, isLoading: previewLoading } = useReelPreviewImage(reel);
  const posterUrl = reel.thumbnail ?? previewUrl;
  const shopItems = shopItemsFromReel(reel);

  const hasPrompt = Boolean(reel.prompt?.trim());
  const hasShop = shopItems.length > 0;
  const hasDownload = (reel.files?.length ?? 0) > 0;

  return (
    <button
      type="button"
      className="group relative w-full rounded-2xl bg-card border border-border/40 text-left overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: "fade-in 0.5s cubic-bezier(0.16,1,0.3,1) backwards",
      }}
      onClick={() => onOpenModal(reel)}
      aria-label={`Open reel: ${reel.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/14] overflow-hidden">
        <ReelThumbnail
          title={reel.title}
          imageUrl={posterUrl}
          isLoading={!posterUrl && previewLoading && !reel.thumbnail}
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Instagram badge — top right */}
        <div className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm border border-white/15">
          <Instagram className="h-3.5 w-3.5 text-white" aria-hidden />
        </div>

        {/* Play hint on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
          <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25">
            <div className="ml-0.5 h-0 w-0 border-y-[7px] border-y-transparent border-l-[12px] border-l-white" />
          </div>
        </div>

        {/* Title + tags — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pt-6">
          <h3
            className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
          >
            {reel.title}
          </h3>

          {/* Resource tags */}
          {(hasPrompt || hasShop || hasDownload) && (
            <div className="flex flex-wrap gap-1">
              {hasPrompt && (
                <ResourceTag
                  icon={Sparkles}
                  label="Prompt"
                  className="bg-primary/80 text-primary-foreground"
                />
              )}
              {hasShop && (
                <ResourceTag
                  icon={ShoppingBag}
                  label="Shop"
                  className="bg-black/50 text-white border border-white/20"
                />
              )}
              {hasDownload && (
                <ResourceTag
                  icon={Download}
                  label="Download"
                  className="bg-black/50 text-white border border-white/20"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ReelCard;
