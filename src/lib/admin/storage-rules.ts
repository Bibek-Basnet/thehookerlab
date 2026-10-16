/* Pure decisions about where uploads go and how failures read; the I/O lives in storage.ts. */

export type StorageTarget = "blob" | "disk";

/* Vercel sets BLOB_READ_WRITE_TOKEN when a Blob store is connected to the project. */
export const storageTarget = (): StorageTarget =>
  process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "disk";

export function uploadFailureMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  const text = err instanceof Error ? err.message : "";
  if (code === "EROFS" || /read-only/i.test(text)) {
    return "This host cannot write files. Connect Vercel Blob storage to the project (it sets BLOB_READ_WRITE_TOKEN) and redeploy, or paste an https:// image URL instead.";
  }
  return "Could not save the image";
}
