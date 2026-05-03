import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { ShopItem } from "@/types/shop";
import { detectShopPlatform } from "@/lib/shopPlatform";
import { cn } from "@/lib/utils";

interface ShopThisLookSheetProps {
  open: boolean;
  onClose: () => void;
  items: ShopItem[];
}

function parsePriceNumber(s: string | undefined): number | null {
  if (!s?.trim()) return null;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function discountPercent(
  price: string | undefined,
  original: string | undefined
): number | null {
  const p = parsePriceNumber(price);
  const o = parsePriceNumber(original);
  if (p == null || o == null || o <= p) return null;
  return Math.round((1 - p / o) * 100);
}

function formatPriceDisplay(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  const t = raw.trim();
  if (/^[₹$€]/.test(t) || /^rs\.?\s*/i.test(t)) return t;
  return `₹${t}`;
}

const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
/** Drag down: dismiss sheet */
const DISMISS_PX = 72;
/** Drag up: expand from peek */
const EXPAND_DRAG_PX = -44;
/** Drag down while expanded: collapse to peek */
const COLLAPSE_PX = 40;
const TAP_MAX_DY = 14;

const ShopThisLookSheet = ({ open, onClose, items }: ShopThisLookSheetProps) => {
  const [expanded, setExpanded] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const maxAbsDy = useRef(0);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  useEffect(() => {
    if (open) setExpanded(false);
  }, [open]);

  const endSheetDrag = useRef<(() => void) | null>(null);

  const handleDragHandlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      endSheetDrag.current?.();
      const startY = e.clientY;
      dragStartY.current = startY;
      maxAbsDy.current = 0;

      const onMove = (ev: PointerEvent) => {
        if (dragStartY.current == null) return;
        const dy = ev.clientY - dragStartY.current;
        maxAbsDy.current = Math.max(maxAbsDy.current, Math.abs(dy));
      };

      const onUp = (ev: PointerEvent) => {
        if (dragStartY.current == null) return;
        const dy = ev.clientY - dragStartY.current;
        dragStartY.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        const ex = expandedRef.current;

        if (dy > DISMISS_PX) {
          onClose();
          return;
        }
        if (ex && dy > COLLAPSE_PX) {
          setExpanded(false);
          return;
        }
        if (!ex && dy < EXPAND_DRAG_PX) {
          setExpanded(true);
          return;
        }
        if (maxAbsDy.current < TAP_MAX_DY) {
          setExpanded((v) => !v);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      endSheetDrag.current = () => {
        dragStartY.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    },
    [onClose]
  );

  useEffect(() => {
    if (open) return;
    endSheetDrag.current?.();
    endSheetDrag.current = null;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hasItems = items.length > 0;
  /** Fixed peek height keeps the trigger (modal/card actions) visible above the sheet */
  const panelHeight = expanded
    ? "min(76dvh, 720px)"
    : hasItems
      ? "min(30dvh, 268px)"
      : "min(22dvh, 200px)";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[110] flex flex-col justify-end",
        !open && "pointer-events-none"
      )}
      aria-hidden={!open}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close shop panel"
        className={cn(
          "absolute inset-0 bg-black/55 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionTimingFunction: SHEET_EASE }}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative flex w-full max-h-[100dvh] flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.45)] transition-[transform,height] duration-[350ms]",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          height: panelHeight,
          transitionTimingFunction: SHEET_EASE,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — drag up expand, drag down collapse/dismiss, tap toggles */}
        <div className="flex shrink-0 flex-col items-center pt-3 pb-2">
          <div
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            className="flex w-full cursor-grab flex-col items-center gap-2 py-1 active:cursor-grabbing [touch-action:none]"
            onPointerDown={handleDragHandlePointerDown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpanded((v) => !v);
              }
            }}
          >
            <span className="h-1 w-10 rounded-full bg-muted-foreground/35 pointer-events-none" />
          </div>
          <h3
            className="mt-1 text-sm font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shop this look
          </h3>
        </div>

        <div className="min-h-0 flex-1 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {hasItems ? (
            <div
              className="flex h-full gap-3 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin] snap-x snap-mandatory"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {items.map((item, idx) => (
                <ShopProductCard
                  key={`${item.url}-${idx}`}
                  item={item}
                  compact={!expanded}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex h-full min-h-[4.5rem] flex-col items-center justify-center px-4 text-center text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <p>No shop links for this look yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ShopProductCard({
  item,
  compact,
}: {
  item: ShopItem;
  compact?: boolean;
}) {
  const platform = detectShopPlatform(item.url);
  const discount = discountPercent(item.price, item.originalPrice);
  const title =
    item.name?.trim() ||
    `${platform.name} product`;

  return (
    <article
      className={cn(
        "flex shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border/50 bg-secondary/40",
        compact ? "w-[148px]" : "w-[170px]"
      )}
    >
      <div
        className={cn(
          "relative w-full bg-muted/30",
          compact ? "h-[72px] shrink-0" : "aspect-square"
        )}
      >
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center font-bold text-muted-foreground/40",
              compact ? "text-lg" : "text-2xl"
            )}
            style={{ fontFamily: "var(--font-display)" }}
            aria-hidden
          >
            {platform.name.slice(0, 1)}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5",
          compact ? "p-2 gap-1" : "p-2.5 gap-1.5"
        )}
      >
        <span
          className={cn(
            "inline-flex w-fit max-w-full items-center rounded-md font-semibold uppercase tracking-wide text-white",
            compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
          )}
          style={{ backgroundColor: platform.color }}
        >
          {platform.name}
        </span>

        <p
          className={cn(
            "font-medium leading-snug text-foreground",
            compact ? "line-clamp-1 text-[11px]" : "line-clamp-2 min-h-[2.5rem] text-xs"
          )}
        >
          {title}
        </p>

        <div
          className={cn(
            "flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5",
            compact ? "text-[10px]" : "text-xs"
          )}
        >
          {item.price ? (
            <span className="font-semibold text-foreground">
              {formatPriceDisplay(item.price)}
            </span>
          ) : null}
          {item.originalPrice ? (
            <span className="text-muted-foreground line-through decoration-muted-foreground/70">
              {formatPriceDisplay(item.originalPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-0.5">
          {discount != null ? (
            <span
              className={cn(
                "rounded bg-primary/20 font-semibold text-primary",
                compact ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[10px]"
              )}
            >
              {discount}% OFF
            </span>
          ) : null}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex flex-1 min-w-0 items-center justify-center gap-1 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]",
              compact ? "px-1.5 py-1 text-[10px]" : "px-2 py-1.5 text-[11px]"
            )}
          >
            Buy
            <ArrowRight className="h-3 w-3 shrink-0 opacity-90" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default ShopThisLookSheet;
