import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DashboardFile } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  WORKBOOKS_BUCKET,
  sanitizeUploadFileName,
  workbookStoragePathFromPublicUrl,
} from "@/lib/workbookStorage";
import { toast } from "sonner";
import { ExternalLink, Loader2, Trash2, Upload } from "lucide-react";

export function DashboardFilesSection({
  reelId,
  userId,
  files,
  onChanged,
}: {
  reelId: string;
  userId: string;
  files: DashboardFile[];
  onChanged: () => void;
}) {
  const [label, setLabel] = useState("Download Workbook");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const path = `${userId}/${crypto.randomUUID()}_${sanitizeUploadFileName(file.name)}`;
    const { error: upErr } = await supabase.storage.from(WORKBOOKS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }

    const { data: pub } = supabase.storage.from(WORKBOOKS_BUCKET).getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: dbErr } = await supabase.from("files").insert({
      reel_id: reelId,
      file_url: publicUrl,
      label: label.trim() || "Download",
    });
    setUploading(false);
    if (dbErr) {
      toast.error(dbErr.message);
      await supabase.storage.from(WORKBOOKS_BUCKET).remove([path]);
      return;
    }
    toast.success("File attached");
    onChanged();
  };

  const handleDelete = async (f: DashboardFile) => {
    setDeletingId(f.id);
    const { error: dbErr } = await supabase.from("files").delete().eq("id", f.id);
    if (dbErr) {
      setDeletingId(null);
      toast.error(dbErr.message);
      return;
    }

    const storagePath = workbookStoragePathFromPublicUrl(f.file_url);
    if (storagePath) {
      const { error: stErr } = await supabase.storage.from(WORKBOOKS_BUCKET).remove([storagePath]);
      if (stErr) console.warn("Storage remove:", stErr.message);
    }

    setDeletingId(null);
    toast.success("File removed");
    onChanged();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Workbooks & downloads</h4>
      <p className="text-xs text-muted-foreground">
        Bucket <code className="rounded bg-secondary px-1">{WORKBOOKS_BUCKET}</code> must exist and
        be public, with storage policies (see <code className="rounded bg-secondary px-1">supabase/sql/002_workbooks_storage.sql</code>).
      </p>

      <ul className="space-y-2">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm"
          >
            <span className="truncate">{f.label || "File"}</span>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(f)}
                disabled={deletingId === f.id}
              >
                {deletingId === f.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Button label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Download Workbook" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload file
          </Button>
        </div>
      </div>
    </div>
  );
}
