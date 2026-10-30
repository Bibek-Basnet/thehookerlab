import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, formatBytes } from "./upload";

/* Browser side of the admin image upload: shrink photos before sending, and turn
   whatever the server answers into one sentence the admin can act on. */

const MAX_EDGE = 2400;
const SHRINK_ABOVE = 1.5 * 1024 * 1024;
const QUALITY = 0.85;

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

const renamed = (name: string, type: string) =>
  `${name.replace(/\.[^.]*$/, "") || "image"}.${type === "image/webp" ? "webp" : "jpg"}`;

const kind = (file: File) =>
  file.type || file.name.match(/\.([^.]+)$/)?.[1]?.toUpperCase() || "this type of";

/* Returns the file to upload: the original when it is already fine, otherwise a
   re-encoded copy no larger than MAX_EDGE on its long side. GIFs pass through so
   animations survive. Throws an Error with an admin-facing message. */
export async function prepareImage(file: File): Promise<File> {
  const supported = ACCEPTED_TYPES.includes(file.type);
  if (file.type === "image/gif" || (supported && file.size <= SHRINK_ABOVE)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (supported) return file;
    throw new Error(
      `This browser cannot read ${kind(file)} images. Save the photo as a JPEG or PNG and upload that instead.`,
    );
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    if (supported) return file;
    throw new Error("This browser could not convert the image. Save it as a JPEG and try again.");
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  /* WebP keeps transparency; browsers that cannot encode it hand back PNG, so fall
     back to JPEG on a white background. */
  let blob = await toBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    blob = await toBlob(canvas, "image/jpeg");
  }
  bitmap.close();

  if (!blob) {
    if (supported) return file;
    throw new Error("This browser could not convert the image. Save it as a JPEG and try again.");
  }
  if (supported && blob.size >= file.size) return file;
  return new File([blob], renamed(file.name, blob.type), { type: blob.type });
}

/* Checked before sending so the admin hears about it without a round trip. */
export function preflightError(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `This image is still ${formatBytes(file.size)} after resizing; the limit is ${MAX_UPLOAD_LABEL}. Export a smaller copy and try again.`;
  }
  return null;
}

/* The error for a failed response. The route always sends JSON { error }, but a
   proxy or the platform (e.g. Vercel's own 413) can answer before it runs. */
export function uploadResponseError(status: number, statusText: string, body: string): string {
  let parsed: { error?: unknown } = {};
  try {
    parsed = JSON.parse(body) as { error?: unknown };
  } catch {
    /* not JSON */
  }
  if (typeof parsed.error === "string" && parsed.error) return parsed.error;

  if (status === 413) {
    return `The server refused the image because it is too large (HTTP 413). Use a photo under ${MAX_UPLOAD_LABEL}.`;
  }
  if (status === 401 || status === 403) {
    return `The server refused the upload (HTTP ${status}). Your session may have expired: sign in again, then retry.`;
  }
  if (status === 504) {
    return "The server took too long to save the image (HTTP 504). Try again, or use a smaller photo.";
  }
  const text = body.trim().startsWith("<") ? "" : body.trim().replace(/\s+/g, " ").slice(0, 200);
  const label = [status, statusText].filter(Boolean).join(" ");
  return `Upload failed: the server answered HTTP ${label}${text ? ` (${text})` : ""}.`;
}

export const NETWORK_ERROR =
  "Could not reach the server, so the image was not uploaded. Check your internet connection and try again.";
