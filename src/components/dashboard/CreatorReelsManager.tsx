import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { DASHBOARD_REELS_QUERY_KEY, fetchDashboardReels } from "@/lib/dashboardReels";
import type { DashboardReel } from "@/types/dashboard";
import { ReelEditorDialog } from "@/components/dashboard/ReelEditorDialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Resource tag badge ─── */
function Tag({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        className
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

/* ─── Reel row ─── */
function ReelRow({
  reel,
  onEdit,
  onDelete,
}: {
  reel: DashboardReel;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasPrompt = Boolean(reel.prompt?.trim());
  const hasShop = (reel.products?.filter((p) => p.link)?.length ?? 0) > 0;
  const hasDownload = (reel.files?.length ?? 0) > 0;

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      {/* Left: title + link + tags */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p
          className="truncate text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {reel.title}
        </p>
        <a
          href={reel.reel_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">{reel.reel_link}</span>
        </a>

        {/* Resource tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {hasPrompt && (
            <Tag
              icon={Sparkles}
              label="Prompt"
              className="border-primary/30 bg-primary/10 text-primary"
            />
          )}
          {hasShop && (
            <Tag
              icon={ShoppingBag}
              label={`Shop · ${reel.products!.filter((p) => p.link).length}`}
              className="border-border/60 bg-secondary/40 text-muted-foreground"
            />
          )}
          {hasDownload && (
            <Tag
              icon={Download}
              label={`Download · ${reel.files!.length}`}
              className="border-border/60 bg-secondary/40 text-muted-foreground"
            />
          )}
          {!hasPrompt && !hasShop && !hasDownload && (
            <span className="text-[11px] text-muted-foreground/60 italic">No resources yet</span>
          )}
        </div>
      </div>

      {/* Right: buttons */}
      <div className="flex shrink-0 gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </li>
  );
}

/* ─── Main manager ─── */
export function CreatorReelsManager({
  user,
  publicHandle,
}: {
  user: User;
  publicHandle: string | null;
}) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editReelId, setEditReelId] = useState<string | null>(null);
  const [deleteReel, setDeleteReel] = useState<DashboardReel | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: reels = [], isLoading, isError, error } = useQuery({
    queryKey: [DASHBOARD_REELS_QUERY_KEY, user.id],
    queryFn: () => fetchDashboardReels(user.id),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [DASHBOARD_REELS_QUERY_KEY, user.id] });

  const editReel = reels.find((r) => r.id === editReelId) ?? null;

  useEffect(() => {
    if (!editReelId || isLoading) return;
    if (!reels.some((r) => r.id === editReelId)) setEditReelId(null);
  }, [editReelId, reels, isLoading]);

  const confirmDelete = async () => {
    if (!deleteReel) return;
    setDeleting(true);
    const { error: err } = await supabase.from("reels").delete().eq("id", deleteReel.id);
    setDeleting(false);
    if (err) { toast.error(err.message); return; }
    toast.success("Reel deleted");
    setDeleteReel(null);
    invalidate();
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your reels
          </h1>
          {publicHandle && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Public page:{" "}
              <a
                href={`/${publicHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                /{publicHandle}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          )}
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add reel
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load reels"}
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && reels.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/80 py-16 text-center">
          <p className="text-sm text-muted-foreground">No reels yet.</p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-3 text-sm text-primary hover:underline"
          >
            + Add your first reel
          </button>
        </div>
      )}

      {/* Reel list */}
      {!isLoading && reels.length > 0 && (
        <ul className="space-y-3">
          {reels.map((r) => (
            <ReelRow
              key={r.id}
              reel={r}
              onEdit={() => setEditReelId(r.id)}
              onDelete={() => setDeleteReel(r)}
            />
          ))}
        </ul>
      )}

      {/* Add reel dialog */}
      <ReelEditorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={user.id}
        mode="create"
        reel={null}
        onSaved={invalidate}
      />

      {/* Edit reel dialog */}
      <ReelEditorDialog
        open={editReelId !== null && editReel !== null}
        onOpenChange={(o) => { if (!o) setEditReelId(null); }}
        userId={user.id}
        mode="edit"
        reel={editReel}
        onSaved={invalidate}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteReel !== null} onOpenChange={(o) => !o && setDeleteReel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteReel?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the reel, its products, and file records. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
