import { slugify } from "./slug";

/* Vercel rejects function request bodies over 4.5 MB before our code runs, so stay
   under that. The admin form shrinks large photos in the browser to fit. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 MB";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const ACCEPTED_TYPES = Object.keys(EXTENSIONS);

/* Returns a message for the admin, or null when the file is acceptable. */
export function validateUpload(type: string, size: number): string | null {
  if (!(type in EXTENSIONS)) {
    return `Upload a JPEG, PNG, WebP, GIF or AVIF image (this file is ${type || "an unknown type"})`;
  }
  if (size <= 0) return "That file is empty";
  if (size > MAX_UPLOAD_BYTES) {
    return `Images must be ${MAX_UPLOAD_LABEL} or smaller (this one is ${formatBytes(size)})`;
  }
  return null;
}

/* "<slug of original name>-<8 chars of content hash>.<ext from the type>".
   The extension always comes from the validated MIME type, never the upload. */
export function uploadFileName(
  originalName: string,
  type: string,
  contentHash: string,
): string {
  const base = originalName.replace(/\.[^.]*$/, "");
  const slug = slugify(base) === "item" ? "image" : slugify(base);
  return `${slug}-${contentHash.slice(0, 8)}.${EXTENSIONS[type]}`;
}

export const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
