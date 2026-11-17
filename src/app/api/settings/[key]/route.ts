import type { NextRequest } from "next/server";
import { SETTINGS, isSettingKey } from "@/content/schema";
import { DEFAULT_SETTINGS } from "@/content/defaults";
import { requireAdmin } from "@/server/auth";
import { connectDB } from "@/server/db";
import { SettingModel } from "@/server/models";
import { refreshSite } from "@/server/revalidate";
import { fail, handle, isSameOrigin, ok, readJson } from "@/server/security";
import { formatZodError, objectSchema } from "@/server/validation";

type Ctx = { params: Promise<{ key: string }> };

export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const { key } = await params;
  if (!isSettingKey(key)) return fail("Not found", 404);
  await requireAdmin(req);
  await connectDB();
  const doc = await SettingModel.findOne({ key }).lean();
  return ok({ ...DEFAULT_SETTINGS[key], ...((doc?.value as object) ?? {}) });
});

export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const { key } = await params;
  if (!isSettingKey(key)) return fail("Not found", 404);
  await requireAdmin(req);
  const parsed = objectSchema(SETTINGS[key].fields).safeParse(await readJson(req, 200_000));
  if (!parsed.success) return fail(formatZodError(parsed.error));
  await connectDB();
  await SettingModel.updateOne({ key }, { $set: { value: parsed.data } }, { upsert: true });
  refreshSite();
  return ok(parsed.data);
});
