import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { AdminModel } from "@/server/models";
import { requireAdmin } from "@/server/auth";
import { fail, handle, isSameOrigin, ok, readJson } from "@/server/security";
import { isObjectId } from "@/server/validation";

type Ctx = { params: Promise<{ id: string }> };

/** Change role and/or revoke all of that admin's sessions. */
export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const me = await requireAdmin(req, "superadmin");
  const { id } = await params;
  if (!isObjectId(id)) return fail("Not found", 404);
  if (id === me.id) return fail("You can't change your own account here");
  const body = await readJson<{ role?: string; revoke?: boolean }>(req, 1_000);
  await connectDB();
  const update: Record<string, unknown> = {};
  if (body.role === "admin" || body.role === "superadmin") update.$set = { role: body.role };
  if (body.revoke) update.$inc = { tokenVersion: 1 };
  if (Object.keys(update).length) await AdminModel.updateOne({ _id: id }, update);
  return ok(true);
});

export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const me = await requireAdmin(req, "superadmin");
  const { id } = await params;
  if (!isObjectId(id)) return fail("Not found", 404);
  if (id === me.id) return fail("You can't delete your own account");
  await connectDB();
  await AdminModel.deleteOne({ _id: id });
  return ok(true);
});
