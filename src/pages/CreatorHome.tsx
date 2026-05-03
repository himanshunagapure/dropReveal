import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/SiteFooter";
import { Sparkles, Download, ShoppingBag, ArrowRight } from "lucide-react";

const EXAMPLE_HANDLE = import.meta.env.VITE_DEFAULT_CREATOR_HANDLE?.trim() || null;

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
}

const FEATURES = [
  {
    icon: Sparkles,
    label: "AI Prompts",
    desc: "Viewers reveal your prompt in one tap and copy it instantly.",
  },
  {
    icon: ShoppingBag,
    label: "Shop Links",
    desc: "Link your outfit, gear, or tools — organised by reel.",
  },
  {
    icon: Download,
    label: "Downloads",
    desc: "Attach a workbook, template, or PDF to any reel.",
  },
] as const;

const LandingPage = () => (
  <div
    className="min-h-screen bg-background text-foreground flex flex-col"
    style={{ fontFamily: "var(--font-body)" }}
  >
    {/* ── Nav ── */}
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          DropReveal
        </span>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="h-9 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95"
        >
          Sign in
        </button>
      </div>
    </header>

    {/* ── Hero ── */}
    <section className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <div
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
        style={{ animation: "fade-in 0.5s ease-out" }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Free for creators
      </div>

      <h1
        className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl"
        style={{
          fontFamily: "var(--font-display)",
          animation: "fade-in 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        Stop managing DMs.
        <br />
        <span className="text-primary">Share everything in one link.</span>
      </h1>

      <p
        className="mt-5 max-w-md text-base text-muted-foreground leading-relaxed"
        style={{ animation: "fade-in 0.7s cubic-bezier(0.16,1,0.3,1)" }}
      >
        Add your AI prompts, shop links, and workbooks to every reel — viewers find them
        instantly, no DMs needed.
      </p>

      <div
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
        style={{ animation: "fade-in 0.8s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <button
          type="button"
          onClick={signInWithGoogle}
          className="flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.97]"
        >
          {/* Google logo */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M17.64 9.2045c0-.638-.0573-1.252-.164-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2587h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.616z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2586c-.806.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.584-5.036-3.7118H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.2818-1.1168-.2818-1.71s.1018-1.17.2818-1.71V4.9582H.9573C.3477 6.1732 0 7.5482 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
            <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
          </svg>
          Sign in with Google
          <ArrowRight className="h-4 w-4 opacity-70" />
        </button>

        {EXAMPLE_HANDLE && (
          <a
            href={`/${EXAMPLE_HANDLE}`}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/60 bg-secondary/40 px-8 text-base font-medium text-foreground transition hover:bg-secondary active:scale-[0.97]"
          >
            See an example
          </a>
        )}
      </div>
    </section>

    {/* ── Features ── */}
    <section className="mx-auto w-full max-w-4xl px-5 pb-24">
      <div className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/50 bg-card p-6"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3
              className="mb-1 text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {label}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <SiteFooter />
  </div>
);

export default LandingPage;
