import { NextResponse } from "next/server";

type ReadResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse };

/* Reads a JSON body with a content-type check and a size cap. */
export async function readJson(req: Request, maxBytes = 32_000): Promise<ReadResult> {
  const type = req.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.includes("application/json")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Expected JSON" }, { status: 415 }),
    };
  }
  const text = await req.text();
  if (text.length > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Payload too large" }, { status: 413 }),
    };
  }
  try {
    return { ok: true, body: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}
