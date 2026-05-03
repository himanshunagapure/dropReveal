import { SiteFooter } from "@/components/SiteFooter";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ title, subtitle, children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-5">
          <a
            href="/"
            className="text-sm font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DropReveal
          </a>
          <span className="text-border/80">·</span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <h1
          className="mb-2 text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mb-10 text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="prose-content">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
