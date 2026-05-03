import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { CreatorProfile } from "@/lib/fetchCreatorProfile";
import { CreatorReelsManager } from "@/components/dashboard/CreatorReelsManager";
import { Loader2, ExternalLink, LogOut } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);

  /* ── Auth listener ── */
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  /* ── Load creator profile ── */
  useEffect(() => {
    if (!user) { setCreator(null); return; }
    let cancelled = false;
    supabase
      .from("creators")
      .select("id, handle, display_name, avatar_url, bio")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setCreator(data as CreatorProfile);
      });
    return () => { cancelled = true; };
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  /* ── Loading spinner ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  /* ── Not logged in → redirect to landing ── */
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const publicHandle = creator?.handle ?? null;
  const displayName = creator?.display_name ?? user.email ?? "Creator";
  const avatarUrl = creator?.avatar_url ?? null;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      {/* ── Dashboard header ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4">
          {/* Left: avatar + name + public link */}
          <div className="flex items-center gap-3 min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-foreground truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {displayName}
              </p>
              {publicHandle && (
                <p className="text-xs text-muted-foreground truncate">
                  dropreveal.com/{publicHandle}
                </p>
              )}
            </div>
          </div>

          {/* Right: View my page + Sign out */}
          <div className="flex items-center gap-2 shrink-0">
            {publicHandle && (
              <a
                href={`/${publicHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
              >
                View my page
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 h-9 rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <CreatorReelsManager user={user} publicHandle={publicHandle} />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Dashboard;
