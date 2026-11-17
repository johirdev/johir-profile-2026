import type { NextRequest } from "next/server";
import { z } from "zod";
import { draftBlogPost } from "@/server/ai";
import { requireAdmin } from "@/server/auth";
import { fail, handle, isSameOrigin, ok, rateLimit, readJson } from "@/server/security";
import { formatZodError } from "@/server/validation";

export const maxDuration = 300;

const Body = z.object({
  subject: z.string().trim().min(4, "Give the AI a subject (at least 4 characters)").max(200),
  notes: z.string().trim().max(1500).optional(),
  tone: z.string().trim().max(60).optional(),
});

export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const session = await requireAdmin(req);
  if (!rateLimit(`ai:${session.id}`, 10, 60 * 60 * 1000).ok) return fail("AI limit reached (10 drafts/hour)", 429);
  const parsed = Body.safeParse(await readJson(req, 8_000));
  if (!parsed.success) return fail(formatZodError(parsed.error));
  return ok(await draftBlogPost(parsed.data));
});
