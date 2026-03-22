import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ReelCard from "@/components/ReelCard";
import ReelModal from "@/components/ReelModal";
import { mockReels, type Reel } from "@/data/mockReels";
import { Search } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

  const filteredReels = useMemo(() => {
    if (!searchQuery.trim()) return mockReels;
    const q = searchQuery.toLowerCase();
    return mockReels.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.prompt.toLowerCase().includes(q) ||
        r.id.includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background relative grain-overlay">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero tagline */}
        <div
          className="mb-10 max-w-xl"
          style={{ animation: 'fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <h1
            className="text-3xl sm:text-4xl font-bold text-foreground leading-[1.1] tracking-tight text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Discover the prompts
            <br />
            <span className="text-primary">behind the reels.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            Tap any reel, reveal the AI prompt that created it. Copy it. Make it yours.
          </p>
        </div>

        {/* Feed */}
        {filteredReels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredReels.map((reel, i) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                index={i}
                onOpenModal={setSelectedReel}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            style={{ animation: 'fade-in 0.4s ease-out' }}
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              No reels found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
    </div>
  );
};

export default Index;
