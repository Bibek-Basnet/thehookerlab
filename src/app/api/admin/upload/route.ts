import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { storeImage } from "@/lib/admin/storage";
import { uploadFailureMessage } from "@/lib/admin/storage-rules";
import {
  MAX_UPLOAD_BYTES,
  uploadFileName,
  validateUpload,
} from "@/lib/admin/upload";
import { getCurrentAdmin } from "@/lib/auth/dal";

/* Saves an admin-uploaded image (Vercel Blob when connected, else public/uploads)
   and returns the URL to store on the row. */
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
    const url = await storeImage(name, bytes, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/upload] store failed", err);
    const message = uploadFailureMessage(err);
    const status = message.startsWith("Could not") ? 500 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
