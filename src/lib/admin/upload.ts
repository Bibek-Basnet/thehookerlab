import { slugify } from "./slug";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/* Returns a message for the admin, or null when the file is acceptable. */
export function validateUpload(type: string, size: number): string | null {
  if (!(type in EXTENSIONS)) return "Upload a JPEG, PNG, WebP, GIF or AVIF image";
  if (size <= 0) return "That file is empty";
  if (size > MAX_UPLOAD_BYTES) return "Images must be 5 MB or smaller";
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
