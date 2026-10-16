import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { storageTarget } from "./storage-rules";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/* Stores an image and returns the public URL to save on the row.
   Vercel Blob when the project is connected to a store, otherwise public/uploads on disk. */
export async function storeImage(
  name: string,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  if (storageTarget() === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      /* The name already carries a content hash, so a repeat upload is the same file. */
      allowOverwrite: true,
    });
    return blob.url;
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/uploads/${name}`;
}
