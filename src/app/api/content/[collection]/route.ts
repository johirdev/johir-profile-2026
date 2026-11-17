import type { NextRequest } from "next/server";
import { isCollectionKey } from "@/content/schema";
import { requireAdmin } from "@/server/auth";
import { afterWrite, prepareWrite } from "@/server/content";
import { connectDB } from "@/server/db";
import { contentModel } from "@/server/models";
import { listAll, serialize } from "@/server/repo";
import { refreshSite } from "@/server/revalidate";
import { fail, handle, isSameOrigin, ok, readJson } from "@/server/security";

type Ctx = { params: Promise<{ collection: string }> };

/** Admin: every row, including unpublished drafts and inbox items. */
export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const { collection } = await params;
  if (!isCollectionKey(collection)) return fail("Unknown collection", 404);
  await requireAdmin(req);
  return ok(await listAll(collection));
});

export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const { collection } = await params;
  if (!isCollectionKey(collection)) return fail("Unknown collection", 404);
  await requireAdmin(req);
  await connectDB();
  const data = await prepareWrite(collection, await readJson(req, 300_000));
  const doc = await contentModel(collection).create(data);
  await afterWrite(collection, String(doc._id), data);
  refreshSite();
  return ok(serialize(doc.toObject()), 201);
});
