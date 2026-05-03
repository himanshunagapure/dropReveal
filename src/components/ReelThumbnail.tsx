import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelThumbnailProps {
  title: string;
  imageUrl?: string;
  /** True while resolving a remote preview image */
  isLoading?: boolean;
  className?: string;
  imgClassName?: string;
}

/** Card/modal image: optional URL, loading shimmer, or a high-contrast placeholder. */
const ReelThumbnail = ({
  title,
  imageUrl,
  isLoading,
  className,
  imgClassName,
}: ReelThumbnailProps) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn("h-full w-full object-cover", imgClassName, className)}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-3 bg-zinc-900/90 p-6",
          className
        )}
      >
        <div className="h-24 w-24 animate-pulse rounded-2xl bg-zinc-700/80" />
        <div className="h-3 w-3/4 max-w-[12rem] animate-pulse rounded bg-zinc-700/80" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[12rem] w-full min-h-0 flex-col items-center justify-center gap-3 border border-white/10 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-6 text-center",
        className
      )}
    >
      <Film className="h-12 w-12 text-zinc-500" strokeWidth={1.25} />
      <span
        className="line-clamp-4 text-xs font-medium leading-snug text-zinc-300/90"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {title}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Preview</span>
    </div>
  );
};

export default ReelThumbnail;
