export const WORKBOOKS_BUCKET = "workbooks";

/** Extract storage object path from a public object URL for the workbooks bucket. */
export function workbookStoragePathFromPublicUrl(publicUrl: string): string | null {
  const needle = `/object/public/${WORKBOOKS_BUCKET}/`;
  const i = publicUrl.indexOf(needle);
  if (i === -1) return null;
  return decodeURIComponent(publicUrl.slice(i + needle.length));
}

export function sanitizeUploadFileName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "file";
}
