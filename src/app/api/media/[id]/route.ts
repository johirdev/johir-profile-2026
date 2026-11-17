import { connectDB } from "@/server/db";
import { MediaModel } from "@/server/models";
import { isObjectId } from "@/server/validation";

type Ctx = { params: Promise<{ id: string }> };

/** Public, immutable file delivery. Content is never re-typed, never sniffed by the browser. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isObjectId(id)) return new Response("Not found", { status: 404 });
  try {
    await connectDB();
    const doc = await MediaModel.findById(id).lean();
    if (!doc) return new Response("Not found", { status: 404 });
    const data = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from((doc.data as unknown as { buffer: ArrayBuffer }).buffer);
    const isPdf = doc.contentType === "application/pdf";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": doc.contentType,
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // Chrome refuses to render PDFs under a sandbox CSP, so only images get it.
        ...(isPdf ? {} : { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" }),
        "Content-Disposition": `inline; filename="${(doc.name || "file").replace(/"/g, "")}"`,
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
