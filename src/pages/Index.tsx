import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReelCard from "@/components/ReelCard";
import ReelModal from "@/components/ReelModal";
import { fetchReelsByCreatorHandle } from "@/lib/fetchReelsByCreatorHandle";
import { fetchCreatorProfile } from "@/lib/fetchCreatorProfile";
import type { Reel } from "@/types/reel";
import { Loader2, Search, X } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  const normalizedHandle = handle.trim().toLowerCase();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

  const {
    data: creator,
    isLoading: creatorLoading,
    isError: creatorError,
  } = useQuery({
    queryKey: ["creator-profile", normalizedHandle],
    queryFn: () => fetchCreatorProfile(normalizedHandle),
    enabled: Boolean(normalizedHandle),
    staleTime: 5 * 60_000,
  });

  const {
    data: reels = [],
    isLoading: reelsLoading,
    isError: reelsError,
    error,
  } = useQuery({
    queryKey: ["reels", "supabase", normalizedHandle],
    queryFn: () => fetchReelsByCreatorHandle(normalizedHandle),
    enabled: Boolean(normalizedHandle),
    staleTime: 60_000,
  });

  const filteredReels = useMemo(() => {
    if (!searchQuery.trim()) return reels;
    const q = searchQuery.toLowerCase();
    return reels.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.prompt.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [searchQuery, reels]);

  const isLoading = creatorLoading || reelsLoading;

  if (!normalizedHandle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Missing creator handle.
      </div>
    );
  }

  if (!isLoading && (creatorError || !creator)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Profile not found
        </p>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          No creator found for <span className="font-medium">/{normalizedHandle}</span>.
        </p>
        <a href="/" className="text-sm text-primary hover:underline">
          Go to DropReveal
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-13 max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <a
            href="/"
            className="text-sm font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DropReveal
          </a>
          <a
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Creator? Sign in →
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {/* ── Creator profile header ── */}
        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : creator ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-center"
            style={{ animation: "fade-in 0.6s cubic-bezier(0.16,1,0.3,1)" }}
          >
            {/* Avatar */}
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name ?? creator.handle}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground ring-2 ring-border">
                {(creator.display_name ?? creator.handle).slice(0, 1).toUpperCase()}
              </div>
            )}

            {/* Name + handle */}
            <div>
              <h1
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {creator.display_name ?? creator.handle}
              </h1>
              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
            </div>

            {/* Bio */}
            {creator.bio?.trim() && (
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                {creator.bio}
              </p>
            )}

            {/* Reel count */}
            <p className="text-xs text-muted-foreground">
              {reels.length} {reels.length === 1 ? "reel" : "reels"}
            </p>
          </div>
        ) : null}

        {/* ── Search bar ── */}
        {!isLoading && reels.length > 0 && (
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by keyword or paste a reel ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-secondary/40 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {reelsError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            <p className="font-medium">Could not load reels</p>
            <p className="mt-1 opacity-80">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {/* ── Reel grid ── */}
        {filteredReels.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {filteredReels.map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} index={i} onOpenModal={setSelectedReel} />
            ))}
          </div>
        )}

        {/* ── No search results ── */}
        {!isLoading && !reelsError && reels.length > 0 && filteredReels.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No reels found for &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !reelsError && reels.length === 0 && creator && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No reels added yet.
          </p>
        )}
      </main>

      <SiteFooter />
      <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
    </div>
  );
};

export default Index;
