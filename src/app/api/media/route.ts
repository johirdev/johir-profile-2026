import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth";
import { connectDB } from "@/server/db";
import { MediaModel } from "@/server/models";
import { fail, handle, isSameOrigin, ok, rateLimit } from "@/server/security";

const MAX_IMAGE = 4 * 1024 * 1024;
const MAX_PDF = 10 * 1024 * 1024;

/**
 * The type is decided from the file's magic bytes, never from the browser's
 * Content-Type or the extension. SVG is deliberately not accepted — it can
 * carry script.
 */
function sniff(b: Buffer): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a") return "image/gif";
  if (b.toString("ascii", 4, 12) === "ftypavif") return "image/avif";
  if (b.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  return null;
}

export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const session = await requireAdmin(req);
  if (!rateLimit(`upload:${session.id}`, 60, 10 * 60 * 1000).ok) return fail("Upload limit reached — wait a few minutes", 429);
  if (Number(req.headers.get("content-length") || 0) > MAX_PDF + 64_000) return fail("File too large", 413);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file received");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) return fail("Only PNG, JPG, WEBP, GIF, AVIF images or PDF files are allowed", 415);
  const limit = type === "application/pdf" ? MAX_PDF : MAX_IMAGE;
  if (buf.length > limit) return fail(`File too large (max ${limit / 1024 / 1024} MB)`, 413);

  await connectDB();
  const name = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 120) || "upload";
  const doc = await MediaModel.create({ data: buf, contentType: type, size: buf.length, name, uploadedBy: session.id });
  return ok({ url: `/api/media/${doc._id}`, type, size: buf.length, name }, 201);
});
