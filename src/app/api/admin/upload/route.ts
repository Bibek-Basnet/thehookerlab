import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import {
  MAX_UPLOAD_BYTES,
  uploadFileName,
  validateUpload,
} from "@/lib/admin/upload";
import { getCurrentAdmin } from "@/lib/auth/dal";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/* Saves an admin-uploaded image under public/uploads and returns its public path.
   Files live on the server's disk, so this suits a persistent host, not Vercel. */
export async function POST(req: Request) {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 4096) {
    return NextResponse.json({ error: "Images must be 5 MB or smaller" }, { status: 413 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ error: "Expected a multipart upload" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Choose an image" }, { status: 400 });

  const problem = validateUpload(file.type, file.size);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const name = uploadFileName(file.name, file.type, hash);

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), bytes);
  } catch (err) {
    console.error("[api/admin/upload] write failed", err);
    return NextResponse.json({ error: "Could not save the image" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
}
