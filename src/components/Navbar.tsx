import { useState } from "react";
import { Search, X } from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar = ({ searchQuery, onSearchChange }: NavbarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-95 group-active:scale-90">
            <span className="text-primary-foreground font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>R</span>
          </div>
          <span
            className="text-lg font-bold tracking-tight text-foreground hidden sm:block"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ReelPrompts
          </span>
        </a>

        {/* Search */}
        <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'flex-1 max-w-md' : ''}`}>
          {searchOpen ? (
            <div className="relative w-full animate-scale-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reels, prompts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <button
                onClick={() => { setSearchOpen(false); onSearchChange(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="h-10 w-10 rounded-xl bg-secondary/60 hover:bg-secondary flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
