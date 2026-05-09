import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Instagram,
  Download,
  ArrowRight,
  Lock,
} from "lucide-react";
import type { Reel } from "@/types/reel";
import InstagramReelEmbed from "@/components/InstagramReelEmbed";
import { UnlockButton } from "@/components/UnlockButton";
import { RestoreAccess } from "@/components/RestoreAccess";
import { shopItemsFromReel } from "@/lib/shopItemsFromReel";
import { detectShopPlatform } from "@/lib/shopPlatform";
import type { ShopItem } from "@/types/shop";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

interface ReelModalProps {
  reel: Reel | null;
  onClose: () => void;
}

/* ─── Helpers ─── */

function parsePriceNumber(s: string | undefined): number | null {
  if (!s?.trim()) return null;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function discountPercent(price?: string, original?: string): number | null {
  const p = parsePriceNumber(price);
  const o = parsePriceNumber(original);
  if (p == null || o == null || o <= p) return null;
  return Math.round((1 - p / o) * 100);
}

function formatPrice(raw?: string): string {
  if (!raw?.trim()) return "";
  const t = raw.trim();
  if (/^[₹$€]/.test(t) || /^rs\.?\s*/i.test(t)) return t;
  return `₹${t}`;
}

/* ─── Inline product card ─── */

function ProductCard({ item }: { item: ShopItem }) {
  const platform = detectShopPlatform(item.url);
  const discount = discountPercent(item.price, item.originalPrice);
  const title = item.name?.trim() || `${platform.name} product`;

  return (
    <article className="flex shrink-0 snap-start w-[148px] flex-col overflow-hidden rounded-xl border border-border/50 bg-secondary/40">
      <div className="relative h-[80px] w-full bg-muted/30">
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground/30"
            aria-hidden
          >
            {platform.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <span
          className="inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: platform.color }}
        >
          {platform.name}
        </span>
        <p className="line-clamp-2 text-[11px] font-medium leading-snug text-foreground min-h-[2rem]">
          {title}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-1.5 text-[10px]">
          {item.price && (
            <span className="font-semibold text-foreground">{formatPrice(item.price)}</span>
          )}
          {item.originalPrice && (
            <span className="text-muted-foreground line-through">{formatPrice(item.originalPrice)}</span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-1 pt-1">
          {discount != null && (
            <span className="rounded bg-primary/20 px-1 py-0.5 text-[9px] font-semibold text-primary">
              {discount}% OFF
            </span>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-[10px] font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
          >
            Shop now
            <ArrowRight className="h-2.5 w-2.5 shrink-0" />
          </a>
        </div>
      </div>
    </article>
  );
}

/* ─── Unlock gate for password-protected reels ─── */

function PasswordUnlock({
  reel,
  onUnlocked,
}: {
  reel: Reel;
  onUnlocked: () => void;
}) {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!password.trim()) return;
    setChecking(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reel_id: reel.id, password: password.trim() }),
      });

      const data = (await res.json()) as { success?: boolean };
      if (data.success) {
        localStorage.setItem(`unlocked_${reel.id}`, "true");
        onUnlocked();
      } else {
        setError("Incorrect password. Check the hint and try again.");
      }
    } catch {
      setError("Could not verify password. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">Password protected</p>
        {reel.unlock_note && (
          <p className="text-xs text-muted-foreground text-center max-w-[240px]">
            {reel.unlock_note}
          </p>
        )}
      </div>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        className="w-full h-10 rounded-xl border border-border/60 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
      <button
        onClick={handleVerify}
        disabled={checking || !password.trim()}
        className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {checking ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Checking…
          </>
        ) : (
          "Unlock"
        )}
      </button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}

/* ─── Unlock gate for paid reels ─── */

function PaidUnlock({
  reel,
  onUnlocked,
}: {
  reel: Reel;
  onUnlocked: (token: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Unlock for ₹{reel.unlock_price_inr}
        </p>
        {reel.unlock_note && (
          <p className="text-xs text-muted-foreground text-center max-w-[240px]">
            {reel.unlock_note}
          </p>
        )}
      </div>
      <UnlockButton reel={reel} onUnlocked={onUnlocked} />
      <RestoreAccess reel={reel} onRestored={onUnlocked} />
    </div>
  );
}

/* ─── Revealed content (prompt + shop + files) ─── */

function RevealedContent({ reel }: { reel: Reel }) {
  const [promptVisible, setPromptVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const promptSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!promptVisible) return;
    const id = window.setTimeout(() => {
      promptSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [promptVisible]);

  const shopItems = shopItemsFromReel(reel);
  const hasPrompt = Boolean(reel.prompt?.trim());
  const hasShop = shopItems.length > 0;
  const hasFiles = (reel.files?.length ?? 0) > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reel.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ── Reveal Prompt ── */}
      {hasPrompt && (
        <div className="space-y-2">
          <button
            onClick={() => setPromptVisible((v) => !v)}
            className={`w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-250 active:scale-[0.97] ${
              promptVisible
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {promptVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Prompt
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Reveal Prompt
              </>
            )}
          </button>

          <div
            ref={promptSectionRef}
            className={`scroll-mt-4 transition-[max-height,opacity] duration-500 ease-out ${
              promptVisible
                ? "max-h-[min(60vh,28rem)] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="relative max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain rounded-xl border border-border/40 bg-secondary/60 p-4">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 z-10 flex h-8 items-center gap-1.5 rounded-lg bg-background/80 px-3 text-xs backdrop-blur-sm hover:bg-background transition-all active:scale-90"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Copy</span>
                  </>
                )}
              </button>
              <p className="pr-20 text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap break-words">
                {reel.prompt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Shop items ── */}
      {hasShop && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Shop this look
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:thin]">
            {shopItems.map((item, i) => (
              <ProductCard key={`${item.url}-${i}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── File downloads ── */}
      {hasFiles && (
        <div className="space-y-2">
          {reel.files!.map((f) => (
            <a
              key={f.id}
              href={f.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium text-foreground bg-secondary/40 hover:bg-secondary border border-border/50 transition-all active:scale-[0.97]"
            >
              <Download className="h-4 w-4 shrink-0" />
              {f.label?.trim() || "Download"}
              <ExternalLink className="h-3.5 w-3.5 opacity-40 ml-auto" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Unlock state type ─── */

type UnlockState =
  | "checking"   // Validating stored drop_token with backend
  | "unlocked"   // Content accessible
  | "locked";    // Gate shown

/* ─── Modal ─── */

const ReelModal = ({ reel, onClose }: ReelModalProps) => {
  const [unlockState, setUnlockState] = useState<UnlockState>("checking");

  const checkUnlockState = useCallback(async (r: Reel) => {
    const unlockType = r.unlock_type ?? "free";

    if (unlockType === "free") {
      setUnlockState("unlocked");
      return;
    }

    if (unlockType === "password") {
      const stored = localStorage.getItem(`unlocked_${r.id}`);
      setUnlockState(stored === "true" ? "unlocked" : "locked");
      return;
    }

    // paid — validate stored drop_token with backend
    const stored = localStorage.getItem(`unlocked_${r.id}`);
    if (stored && stored !== "true") {
      try {
        const res = await fetch(`${BACKEND_URL}/drop?token=${stored}`);
        if (res.ok) {
          setUnlockState("unlocked");
          return;
        }
      } catch {
        // fall through to locked
      }
      // Token invalid / expired — clear it
      localStorage.removeItem(`unlocked_${r.id}`);
    }
    setUnlockState("locked");
  }, []);

  useEffect(() => {
    if (!reel) return;
    setUnlockState("checking");
    checkUnlockState(reel);
  }, [reel?.id, checkUnlockState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!reel) return null;

  const unlockType = reel.unlock_type ?? "free";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ animation: "fade-in 0.2s ease-out" }}
      />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-card border border-border/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scale-in 0.28s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all active:scale-90"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Instagram embed */}
        <InstagramReelEmbed
          reelUrl={reel.reel_link}
          title={reel.title}
          thumbnailUrl={reel.thumbnail}
          resetKey={reel.id}
        />

        <div className="p-5 space-y-4 -mt-1">
          {/* Title */}
          <h2
            className="text-xl font-bold text-foreground leading-tight text-balance pr-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {reel.title}
          </h2>

          {/* Open on Instagram link */}
          <a
            href={reel.reel_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium border border-border/60 bg-secondary/30 text-foreground hover:bg-secondary/50 transition-all active:scale-[0.98]"
          >
            <Instagram className="h-4 w-4 shrink-0" />
            Open on Instagram
            <ExternalLink className="h-3.5 w-3.5 opacity-50" />
          </a>

          {/* ── Unlock gate / content ── */}
          {unlockState === "checking" && (
            <div className="flex items-center justify-center py-6">
              <span className="h-5 w-5 rounded-full border-2 border-muted border-t-primary animate-spin" />
            </div>
          )}

          {unlockState === "unlocked" && (
            <RevealedContent reel={reel} />
          )}

          {unlockState === "locked" && unlockType === "password" && (
            <PasswordUnlock
              reel={reel}
              onUnlocked={() => setUnlockState("unlocked")}
            />
          )}

          {unlockState === "locked" && unlockType === "paid" && (
            <PaidUnlock
              reel={reel}
              onUnlocked={() => setUnlockState("unlocked")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelModal;
