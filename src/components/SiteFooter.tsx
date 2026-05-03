const LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer
      className="border-t border-border/50 py-8 px-5"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto max-w-5xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} DropReveal
        </span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
