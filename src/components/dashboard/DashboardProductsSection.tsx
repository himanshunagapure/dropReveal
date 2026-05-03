import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DashboardProduct } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = parseFloat(t.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function ProductRow({
  product,
  onRemoved,
}: {
  product: DashboardProduct;
  onRemoved: () => void;
}) {
  const [name, setName] = useState(product.name ?? "");
  const [link, setLink] = useState(product.link ?? "");
  const [imageUrl, setImageUrl] = useState(product.image_url ?? "");
  const [price, setPrice] = useState(
    product.price != null ? String(product.price) : ""
  );
  const [originalPrice, setOriginalPrice] = useState(
    product.original_price != null ? String(product.original_price) : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!link.trim()) {
      toast.error("Product link is required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim() || null,
        link: link.trim(),
        image_url: imageUrl.trim() || null,
        price: parseOptionalNumber(price),
        original_price: parseOptionalNumber(originalPrice),
      })
      .eq("id", product.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Product saved");
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    setDeleting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Product removed");
      onRemoved();
    }
  };

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Link</Label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Image URL</Label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Price</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 99" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Original price</Label>
          <Input
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="MRP"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save product
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Remove
        </Button>
      </div>
    </div>
  );
}

export function DashboardProductsSection({
  reelId,
  products,
  onChanged,
}: {
  reelId: string;
  products: DashboardProduct[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [adding, setAdding] = useState(false);

  const nextOrder =
    products.reduce((m, p) => Math.max(m, p.display_order ?? 0), 0) + 1;

  const handleAdd = async () => {
    if (!link.trim()) {
      toast.error("Link is required to add a product.");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("products").insert({
      reel_id: reelId,
      name: name.trim() || null,
      link: link.trim(),
      image_url: imageUrl.trim() || null,
      price: parseOptionalNumber(price),
      original_price: parseOptionalNumber(originalPrice),
      display_order: nextOrder,
    });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product added");
    setName("");
    setLink("");
    setImageUrl("");
    setPrice("");
    setOriginalPrice("");
    onChanged();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Shop products</h4>
      <div className="space-y-3">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onRemoved={onChanged} />
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-border/80 p-4 space-y-3">
        <p className="text-xs text-muted-foreground">Add another product</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Link *</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Price</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Original price</Label>
            <Input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
          </div>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={handleAdd} disabled={adding}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add product
        </Button>
      </div>
    </div>
  );
}
