import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DashboardReel } from "@/types/dashboard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  WORKBOOKS_BUCKET,
  sanitizeUploadFileName,
  workbookStoragePathFromPublicUrl,
} from "@/lib/workbookStorage";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2, Upload, Lock, Eye, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type UnlockMode = "free" | "password" | "paid";

type Mode = "create" | "edit";

// dbId = set when product/file already exists in the database
type LocalProduct = {
  _id: string;
  dbId?: string;
  link: string;
  name: string;
  imageUrl: string;
  price: string;
  originalPrice: string;
};

type LocalFile = {
  _id: string;
  dbId?: string;
  fileUrl?: string;
  file?: File;
  label: string;
};

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseFloat(t.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseUnlockPrice(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseFloat(t.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n >= 10 ? n : null;
}

function reelWriteFields(fields: {
  reel_link: string;
  title: string;
  prompt: string;
  thumbnail: string;
  unlock_type: string;
  unlock_price_inr: string;
  unlock_note: string;
}) {
  const t = fields.thumbnail.trim();
  const price = parseUnlockPrice(fields.unlock_price_inr);
  return {
    reel_link: fields.reel_link.trim(),
    title: fields.title.trim(),
    prompt: fields.prompt,
    thumbnail: (t ? t : null) as string | null,
    unlock_type: fields.unlock_type,
    unlock_price_inr: fields.unlock_type === "paid" ? price : null,
    unlock_note: fields.unlock_note.trim() || null,
  };
}

function TogglePill({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all select-none",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      {active && <Check className="h-3 w-3 shrink-0" />}
      {label}
    </button>
  );
}

// ── Product row in the committed list ────────────────────────────────────────
function ProductItem({
  product,
  onRemove,
}: {
  product: LocalProduct;
  onRemove: () => void;
}) {
  return (
    <li className="flex min-w-0 items-start justify-between gap-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{product.name || product.link}</p>
        {product.name && (
          <p className="truncate text-xs text-muted-foreground">{product.link}</p>
        )}
        {(product.price || product.originalPrice) && (
          <p className="text-xs text-muted-foreground">
            {product.price && `₹${product.price}`}
            {product.price && product.originalPrice && " · "}
            {product.originalPrice && `MRP ₹${product.originalPrice}`}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

// ── File row in the committed list ───────────────────────────────────────────
function FileItem({
  file,
  onRemove,
}: {
  file: LocalFile;
  onRemove: () => void;
}) {
  const name = file.file
    ? file.file.name
    : file.fileUrl
    ? (file.fileUrl.split("/").pop() ?? "file")
    : "file";

  return (
    <li className="flex min-w-0 items-start justify-between gap-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{file.label}</p>
        <p className="truncate text-xs text-muted-foreground">{name}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export function ReelEditorDialog({
  open,
  onOpenChange,
  userId,
  mode,
  reel,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  mode: Mode;
  reel: DashboardReel | null;
  onSaved: () => void;
}) {
  // ── Core reel fields ────────────────────────────────────────────────────────
  const [reelLink, setReelLink] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Unlock settings ──────────────────────────────────────────────────────────
  const [unlockMode, setUnlockMode] = useState<UnlockMode>("free");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockPriceInr, setUnlockPriceInr] = useState("");
  const [unlockNote, setUnlockNote] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Section toggles ─────────────────────────────────────────────────────────
  const [showRevealText, setShowRevealText] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  // ── Committed lists ──────────────────────────────────────────────────────────
  const [localProducts, setLocalProducts] = useState<LocalProduct[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);

  // ── In-progress product form (state lives HERE so Save Reel can access it) ──
  const [prodLink, setProdLink] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");

  // ── In-progress file form ────────────────────────────────────────────────────
  const [fileLabel, setFileLabel] = useState("Download Workbook");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wasOpen = useRef(false);
  const lastEditId = useRef<string | null>(null);

  // ── Reset helpers ────────────────────────────────────────────────────────────
  const clearProductForm = () => {
    setProdLink(""); setProdName(""); setProdImageUrl("");
    setProdPrice(""); setProdOriginalPrice("");
  };

  const clearFileForm = () => setFileLabel("Download Workbook");

  const clearUnlockForm = () => {
    setUnlockMode("free");
    setUnlockPassword("");
    setUnlockPriceInr("");
    setUnlockNote("");
  };

  // ── Init / re-init dialog state when it opens ────────────────────────────────
  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }

    const justOpened = !wasOpen.current;
    wasOpen.current = true;

    if (mode === "create") {
      if (justOpened) {
        setReelLink(""); setTitle(""); setPrompt(""); setThumbnail("");
        setShowRevealText(false); setShowProducts(false); setShowFiles(false);
        setLocalProducts([]); setLocalFiles([]);
        clearProductForm(); clearFileForm(); clearUnlockForm();
      }
      return;
    }

    if (!reel) return;
    const switchedReel = lastEditId.current !== reel.id;
    if (justOpened || switchedReel) {
      lastEditId.current = reel.id;
      setReelLink(reel.reel_link);
      setTitle(reel.title);
      setPrompt(reel.prompt ?? "");
      setThumbnail(reel.thumbnail?.trim() ?? "");
      setShowRevealText(Boolean(reel.prompt?.trim()));
      setShowProducts(Boolean(reel.products?.length));
      setShowFiles(Boolean(reel.files?.length));
      setUnlockMode((reel.unlock_type ?? "free") as UnlockMode);
      setUnlockPriceInr(reel.unlock_price_inr != null ? String(reel.unlock_price_inr) : "");
      setUnlockNote(reel.unlock_note ?? "");
      setUnlockPassword(""); // never pre-filled — server-side only
      setLocalProducts(
        (reel.products ?? []).map((p) => ({
          _id: crypto.randomUUID(),
          dbId: p.id,
          link: p.link ?? "",
          name: p.name ?? "",
          imageUrl: p.image_url ?? "",
          price: p.price != null ? String(p.price) : "",
          originalPrice: p.original_price != null ? String(p.original_price) : "",
        }))
      );
      setLocalFiles(
        (reel.files ?? []).map((f) => ({
          _id: crypto.randomUUID(),
          dbId: f.id,
          fileUrl: f.file_url,
          label: f.label ?? "Download",
        }))
      );
      clearProductForm(); clearFileForm();
    }
  }, [open, mode, reel]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add product to committed list ────────────────────────────────────────────
  const commitProduct = (
    overrideLink?: string
  ): LocalProduct | null => {
    const link = (overrideLink ?? prodLink).trim();
    if (!link) return null;
    const p: LocalProduct = {
      _id: crypto.randomUUID(),
      link,
      name: prodName.trim(),
      imageUrl: prodImageUrl.trim(),
      price: prodPrice.trim(),
      originalPrice: prodOriginalPrice.trim(),
    };
    setLocalProducts((prev) => [...prev, p]);
    clearProductForm();
    return p;
  };

  const handleAddProduct = () => {
    if (!prodLink.trim()) { toast.error("Product link is required."); return; }
    commitProduct();
  };

  // ── Pick file ────────────────────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLocalFiles((prev) => [
      ...prev,
      { _id: crypto.randomUUID(), file, label: fileLabel.trim() || "Download" },
    ]);
    clearFileForm();
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSaveReel = async () => {
    if (!reelLink.trim() || !title.trim()) {
      toast.error("URL link and title are required.");
      return;
    }

    // Auto-flush in-progress product if the link field has content
    let allProducts = [...localProducts];
    if (showProducts && prodLink.trim()) {
      const flushed: LocalProduct = {
        _id: crypto.randomUUID(),
        link: prodLink.trim(),
        name: prodName.trim(),
        imageUrl: prodImageUrl.trim(),
        price: prodPrice.trim(),
        originalPrice: prodOriginalPrice.trim(),
      };
      allProducts = [...allProducts, flushed];
    }

    // Validate paid unlock price
    if (unlockMode === "paid") {
      const price = parseUnlockPrice(unlockPriceInr);
      if (!price || price < 10) {
        toast.error("Price must be at least ₹10 for paid unlocks.");
        return;
      }
    }

    const effectivePrompt = showRevealText ? prompt : "";
    const fields = reelWriteFields({
      reel_link: reelLink,
      title,
      prompt: effectivePrompt,
      thumbnail,
      unlock_type: unlockMode,
      unlock_price_inr: unlockPriceInr,
      unlock_note: unlockNote,
    });

    setSaving(true);

    // ── Edit mode ──────────────────────────────────────────────────────────────
    if (mode === "edit" && reel?.id) {
      const targetId = reel.id;

      // 1. Core reel fields
      let thumbSkipped = false;
      let err = (
        await supabase.from("reels").update(fields).eq("id", targetId).eq("creator_id", userId)
      ).error;
      if (err && /thumbnail|column/i.test(err.message)) {
        const { thumbnail: _t, ...withoutThumb } = fields;
        err = (
          await supabase.from("reels").update(withoutThumb).eq("id", targetId).eq("creator_id", userId)
        ).error;
        if (!err) thumbSkipped = true;
      }
      if (err) { setSaving(false); toast.error(err.message); return; }

      // 2. Products — differential sync
      //    Delete only removed products (by their DB id), insert only new ones
      const originalProductIds = new Set((reel.products ?? []).map((p) => p.id));
      const keptProductIds = showProducts
        ? new Set(allProducts.filter((p) => p.dbId).map((p) => p.dbId!))
        : new Set<string>();
      const productIdsToDelete = [...originalProductIds].filter(
        (id) => !keptProductIds.has(id)
      );

      if (productIdsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from("products")
          .delete()
          .in("id", productIdsToDelete);
        if (delErr) { setSaving(false); toast.error(`Delete products: ${delErr.message}`); return; }
      }

      if (showProducts) {
        const newProds = allProducts.filter((p) => !p.dbId);
        if (newProds.length > 0) {
          const { data: inserted, error: insErr } = await supabase
            .from("products")
            .insert(
              newProds.map((p, i) => ({
                reel_id: targetId,
                link: p.link,
                name: p.name || null,
                image_url: p.imageUrl || null,
                price: parseOptionalNumber(p.price),
                original_price: parseOptionalNumber(p.originalPrice),
                display_order: keptProductIds.size + i + 1,
              }))
            )
            .select();
          if (insErr) { setSaving(false); toast.error(`Save products: ${insErr.message}`); return; }
          if (!inserted?.length) {
            toast.warning("Products could not be saved — verify Supabase RLS policies for the products table.");
          }
        }
      }

      // 3. Files — delete removed, upload new
      const keptFileIds = new Set(
        localFiles.filter((f) => f.dbId).map((f) => f.dbId!)
      );
      for (const original of reel.files ?? []) {
        if (!keptFileIds.has(original.id)) {
          await supabase.from("files").delete().eq("id", original.id);
          const sp = workbookStoragePathFromPublicUrl(original.file_url);
          if (sp) await supabase.storage.from(WORKBOOKS_BUCKET).remove([sp]);
        }
      }
      for (const lf of localFiles) {
        if (lf.dbId || !lf.file) continue;
        const path = `${userId}/${crypto.randomUUID()}_${sanitizeUploadFileName(lf.file.name)}`;
        const { error: upErr } = await supabase.storage
          .from(WORKBOOKS_BUCKET)
          .upload(path, lf.file, { cacheControl: "3600", upsert: false });
        if (upErr) { toast.error(`Upload "${lf.file.name}": ${upErr.message}`); continue; }
        const { data: pub } = supabase.storage.from(WORKBOOKS_BUCKET).getPublicUrl(path);
        const { data: inserted, error: fileErr } = await supabase
          .from("files")
          .insert({ reel_id: targetId, file_url: pub.publicUrl, label: lf.label || "Download" })
          .select();
        if (fileErr) { toast.error(`File record "${lf.file.name}": ${fileErr.message}`); continue; }
        if (!inserted?.length) {
          toast.warning(`File "${lf.file.name}" uploaded but record could not be saved — verify Supabase RLS for the files table.`);
        }
      }

      setSaving(false);
      clearProductForm();
      toast.success(thumbSkipped ? "Reel saved (thumbnail skipped — run 001_reels_thumbnail.sql)" : "Reel saved");
      onSaved();
      return;
    }

    // ── Create mode ────────────────────────────────────────────────────────────
    let { data, error } = await supabase
      .from("reels")
      .insert({ creator_id: userId, ...fields })
      .select()
      .single();
    let thumbSkippedCreate = false;
    if (error && /thumbnail|column/i.test(error.message)) {
      const { thumbnail: _t, ...withoutThumb } = fields;
      ({ data, error } = await supabase
        .from("reels")
        .insert({ creator_id: userId, ...withoutThumb })
        .select()
        .single());
      if (!error) thumbSkippedCreate = true;
    }
    if (error) { setSaving(false); toast.error(error.message); return; }

    const newReelId = (data as DashboardReel).id;

    if (showProducts && allProducts.length > 0) {
      const { data: inserted, error: prodErr } = await supabase
        .from("products")
        .insert(
          allProducts.map((p, i) => ({
            reel_id: newReelId,
            link: p.link,
            name: p.name || null,
            image_url: p.imageUrl || null,
            price: parseOptionalNumber(p.price),
            original_price: parseOptionalNumber(p.originalPrice),
            display_order: i + 1,
          }))
        )
        .select();
      if (prodErr) toast.error(`Products: ${prodErr.message}`);
      else if (!inserted?.length) toast.warning("Products could not be saved — verify Supabase RLS for the products table.");
    }

    if (showFiles && localFiles.length > 0) {
      for (const lf of localFiles) {
        if (!lf.file) continue;
        const path = `${userId}/${crypto.randomUUID()}_${sanitizeUploadFileName(lf.file.name)}`;
        const { error: upErr } = await supabase.storage
          .from(WORKBOOKS_BUCKET)
          .upload(path, lf.file, { cacheControl: "3600", upsert: false });
        if (upErr) { toast.error(`Upload "${lf.file.name}": ${upErr.message}`); continue; }
        const { data: pub } = supabase.storage.from(WORKBOOKS_BUCKET).getPublicUrl(path);
        const { data: inserted, error: fileErr } = await supabase
          .from("files")
          .insert({ reel_id: newReelId, file_url: pub.publicUrl, label: lf.label || "Download" })
          .select();
        if (fileErr) toast.error(`File record "${lf.file.name}": ${fileErr.message}`);
        else if (!inserted?.length) toast.warning(`File "${lf.file.name}" could not be saved — verify Supabase RLS for the files table.`);
      }
    }

    // For password mode in create, set the password via backend after reel is created
    if (unlockMode === "password" && unlockPassword.trim().length >= 4) {
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
        await fetch(`${BACKEND_URL}/set-reel-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reel_id: newReelId, creator_id: userId, password: unlockPassword }),
        });
      } catch {
        toast.warning("Reel created but password could not be saved. Set it from edit mode.");
      }
    }

    setSaving(false);
    clearProductForm(); clearFileForm(); clearUnlockForm();
    toast.success(thumbSkippedCreate ? "Reel created (thumbnail skipped — run 001_reels_thumbnail.sql)." : "Reel created.");
    onSaved();
    onOpenChange(false);
  };

  // ── Save password via backend (bcrypt hashing, never client-side) ────────────
  const handleSavePassword = async () => {
    if (!reel?.id || !unlockPassword.trim() || unlockPassword.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
      const res = await fetch(`${BACKEND_URL}/set-reel-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reel_id: reel.id, creator_id: userId, password: unlockPassword }),
      });
      if (!res.ok) throw new Error("Server error");
      setUnlockPassword("");
      toast.success("Password saved.");
    } catch {
      toast.error("Failed to save password. Check your backend connection.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Flex column + inner scroll so footer stays visible (grid + overflow on same node breaks layout)
          "flex h-[min(90dvh,52rem)] max-h-[min(90dvh,52rem)] w-[calc(100vw-1.25rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0",
          "translate-y-[-48%] sm:translate-y-[-50%]"
        )}
      >
        {/* Header — fixed at top (room for Radix close button) */}
        <div className="shrink-0 border-b border-border/40 px-6 pb-3 pt-6 pr-14">
          <DialogHeader className="space-y-0 text-left">
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>
              {mode === "create" ? "Add reel" : "Edit reel"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable body — only this region scrolls; min-w-0 prevents flex overflow */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-6 py-4">
        {/* ── Core fields ── */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reel-link">URL Link</Label>
            <Input
              id="reel-link"
              placeholder="https://www.instagram.com/reel/… or any URL"
              value={reelLink}
              onChange={(e) => setReelLink(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reel-title">Title</Label>
            <Input
              id="reel-title"
              placeholder="Give this reel a searchable title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reel-thumb">Thumbnail image URL (optional)</Label>
            <Input
              id="reel-thumb"
              placeholder="https://…"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>
        </div>

        {/* ── Unlock Settings ── */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Unlock Settings
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { mode: "free" as UnlockMode, label: "Free", icon: Eye },
                { mode: "password" as UnlockMode, label: "Password", icon: Lock },
                { mode: "paid" as UnlockMode, label: "Paid", icon: DollarSign },
              ] as const
            ).map(({ mode: m, label, icon: Icon }) => (
              <button
                key={m}
                type="button"
                onClick={() => setUnlockMode(m)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all select-none",
                  unlockMode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {unlockMode === m && <Check className="h-3 w-3 shrink-0" />}
                <Icon className="h-3 w-3 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {unlockMode === "free" && (
            <p className="text-xs text-muted-foreground">
              Content is visible immediately — no action required from viewers.
            </p>
          )}

          {unlockMode === "password" && (
            <div className="space-y-3 rounded-lg border border-dashed border-border/80 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="unlock-note" className="text-xs">Hint for viewers (optional)</Label>
                <Input
                  id="unlock-note"
                  placeholder='e.g. "Check my story for the password"'
                  value={unlockNote}
                  onChange={(e) => setUnlockNote(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unlock-password" className="text-xs">
                  {mode === "edit" ? "Set new password" : "Password"}
                </Label>
                <Input
                  id="unlock-password"
                  type="password"
                  placeholder="Min. 4 characters"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Hashed server-side via bcrypt — never stored in plain text.
                </p>
              </div>
              {mode === "edit" && reel?.id && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={savingPassword || unlockPassword.length < 4}
                  onClick={handleSavePassword}
                >
                  {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Password Now
                </Button>
              )}
            </div>
          )}

          {unlockMode === "paid" && (
            <div className="space-y-3 rounded-lg border border-dashed border-border/80 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="unlock-price" className="text-xs">Price (₹) — minimum ₹10</Label>
                <Input
                  id="unlock-price"
                  type="number"
                  min={10}
                  step={1}
                  placeholder="e.g. 99"
                  value={unlockPriceInr}
                  onChange={(e) => setUnlockPriceInr(e.target.value)}
                />
                {unlockPriceInr && parseUnlockPrice(unlockPriceInr) != null && (
                  <p className="text-[10px] text-muted-foreground">
                    You earn ₹{(parseUnlockPrice(unlockPriceInr)! * 0.80).toFixed(2)} (free plan) ·
                    ₹{(parseUnlockPrice(unlockPriceInr)! * 0.90).toFixed(2)} (Pro plan)
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unlock-note-paid" className="text-xs">Note for viewers (optional)</Label>
                <Input
                  id="unlock-note-paid"
                  placeholder='e.g. "Includes the full 30-prompt pack"'
                  value={unlockNote}
                  onChange={(e) => setUnlockNote(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Section toggles ── */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Include in this reel
          </p>
          <div className="flex flex-wrap gap-2">
            <TogglePill label="Reveal Text" active={showRevealText} onChange={setShowRevealText} />
            <TogglePill label="Shop Products" active={showProducts} onChange={setShowProducts} />
            <TogglePill label="Workbook / Download" active={showFiles} onChange={setShowFiles} />
          </div>
        </div>

        {/* ── Reveal Text ── */}
        {showRevealText && (
          <div className="space-y-1.5">
            <Label htmlFor="reel-prompt">Reveal Text</Label>
            <Textarea
              id="reel-prompt"
              placeholder="Paste your prompt, instructions, or any text viewers should reveal…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-y min-h-[120px]"
            />
          </div>
        )}

        {/* ── Shop Products ── */}
        {showProducts && (
          <>
            <Separator className="my-2" />
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Shop products</h4>

              {/* Committed product list */}
              {localProducts.length > 0 && (
                <ul className="space-y-2">
                  {localProducts.map((p) => (
                    <ProductItem
                      key={p._id}
                      product={p}
                      onRemove={() =>
                        setLocalProducts((prev) => prev.filter((x) => x._id !== p._id))
                      }
                    />
                  ))}
                </ul>
              )}

              {/* In-progress product form — state lives in parent */}
              <div className="min-w-0 max-w-full space-y-3 rounded-lg border border-dashed border-border/80 p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  {localProducts.length === 0 ? "Add a product" : "Add another product"}
                </p>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Link *</Label>
                    <Input value={prodLink} onChange={(e) => setProdLink(e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Product name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Image URL</Label>
                    <Input value={prodImageUrl} onChange={(e) => setProdImageUrl(e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    <div className="min-w-0 space-y-1">
                      <Label className="text-xs">Price</Label>
                      <Input
                        className="min-w-0"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="e.g. 99"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <Label className="text-xs">Original price</Label>
                      <Input
                        className="min-w-0"
                        value={prodOriginalPrice}
                        onChange={(e) => setProdOriginalPrice(e.target.value)}
                        placeholder="e.g. 149"
                      />
                    </div>
                  </div>
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4" />
                  Add to list
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Products in the list above are saved when you click <strong>Save reel</strong>. If the link field is filled but you haven&apos;t clicked "Add to list", it will also be saved automatically.
              </p>
            </div>
          </>
        )}

        {/* ── Workbooks & Downloads ── */}
        {showFiles && (
          <>
            <Separator className="my-2" />
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Workbooks & downloads</h4>

              {/* Committed file list */}
              {localFiles.length > 0 && (
                <ul className="space-y-2">
                  {localFiles.map((f) => (
                    <FileItem
                      key={f._id}
                      file={f}
                      onRemove={() =>
                        setLocalFiles((prev) => prev.filter((x) => x._id !== f._id))
                      }
                    />
                  ))}
                </ul>
              )}

              {/* In-progress file form */}
              <div className="min-w-0 max-w-full space-y-3 rounded-lg border border-dashed border-border/80 p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  {localFiles.length === 0 ? "Upload a file" : "Upload another file"}
                </p>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Button label (shown to viewers)</Label>
                    <Input
                      value={fileLabel}
                      onChange={(e) => setFileLabel(e.target.value)}
                      placeholder="Download Workbook"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    onChange={handleFilePick}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Pick file &amp; add to list
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Files in the list above are uploaded and saved when you click <strong>Save reel</strong>.
              </p>
            </div>
          </>
        )}
        </div>

        {/* Footer — always visible at bottom of dialog */}
        <div className="shrink-0 border-t border-border/60 bg-background px-6 py-4">
          <DialogFooter className="gap-2 sm:gap-0 sm:justify-end p-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveReel} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Add reel" : "Save reel"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
