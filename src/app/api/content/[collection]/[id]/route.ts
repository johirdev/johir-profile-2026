import type { NextRequest } from "next/server";
import { isCollectionKey } from "@/content/schema";
import { requireAdmin } from "@/server/auth";
import { afterWrite, prepareWrite } from "@/server/content";
import { connectDB } from "@/server/db";
import { contentModel } from "@/server/models";
import { serialize } from "@/server/repo";
import { refreshSite } from "@/server/revalidate";
import { HttpError, fail, handle, isSameOrigin, ok, readJson } from "@/server/security";
import { isObjectId } from "@/server/validation";

type Ctx = { params: Promise<{ collection: string; id: string }> };

async function resolve(req: NextRequest, ctx: Ctx, write = false) {
  if (write && !isSameOrigin(req)) throw new HttpError(403, "Cross-site request blocked");
  const { collection, id } = await ctx.params;
  if (!isCollectionKey(collection) || !isObjectId(id)) throw new HttpError(404, "Not found");
  await requireAdmin(req);
  await connectDB();
  return { collection, id, Model: contentModel(collection) };
}

export const GET = handle(async (req: NextRequest, ctx: Ctx) => {
  const r = await resolve(req, ctx);
  const doc = await r.Model.findById(r.id).lean();
  return doc ? ok(serialize(doc)) : fail("Not found", 404);
});

/** Full replace (the admin form always sends every field). */
export const PUT = handle(async (req: NextRequest, ctx: Ctx) => {
  const r = await resolve(req, ctx, true);
  const data = await prepareWrite(r.collection, await readJson(req, 300_000), { id: r.id });
  const doc = await r.Model.findByIdAndUpdate(r.id, { $set: data }, { new: true }).lean();
  if (!doc) return fail("Not found", 404);
  await afterWrite(r.collection, r.id, data);
  refreshSite();
  return ok(serialize(doc));
});

/** Partial update — quick toggles such as published / featured / status. */
export const PATCH = handle(async (req: NextRequest, ctx: Ctx) => {
  const r = await resolve(req, ctx, true);
  const data = await prepareWrite(r.collection, await readJson(req, 20_000), { partial: true, id: r.id });
  if (!Object.keys(data).length) return fail("Nothing to update");
  const doc = await r.Model.findByIdAndUpdate(r.id, { $set: data }, { new: true }).lean();
  if (!doc) return fail("Not found", 404);
  await afterWrite(r.collection, r.id, data);
  refreshSite();
  return ok(serialize(doc));
});

export const DELETE = handle(async (req: NextRequest, ctx: Ctx) => {
  const r = await resolve(req, ctx, true);
  const res = await r.Model.deleteOne({ _id: r.id });
  if (!res.deletedCount) return fail("Not found", 404);
  refreshSite();
  return ok(true);
});
