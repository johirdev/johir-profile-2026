import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth";
import { renderMarkdown } from "@/server/markdown";
import { fail, handle, isSameOrigin, ok, readJson } from "@/server/security";

/** Admin editor live preview — rendered by exactly the same pipeline as the public blog. */
export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  await requireAdmin(req);
  const { markdown } = await readJson<{ markdown?: string }>(req, 120_000);
  return ok({ html: renderMarkdown(typeof markdown === "string" ? markdown : "") });
});
