import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { AdminModel } from "@/server/models";
import { hashPassword, passwordProblem, requireAdmin, sessionCookie, signSession, verifyPassword } from "@/server/auth";
import { fail, handle, isSameOrigin, ok, rateLimit, readJson } from "@/server/security";

/** Changing the password revokes every other session (token version bump). */
export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const session = await requireAdmin(req);
  if (!rateLimit(`pw:${session.id}`, 5, 15 * 60 * 1000).ok) return fail("Too many attempts — try later", 429);

  const body = await readJson<{ current?: unknown; next?: unknown }>(req, 4_000);
  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";
  const weak = passwordProblem(next);
  if (weak) return fail(weak);
  if (current === next) return fail("The new password must be different");

  await connectDB();
  const admin = await AdminModel.findById(session.id).select("+passwordHash");
  if (!admin || !(await verifyPassword(current, admin.passwordHash))) return fail("Current password is incorrect", 401);

  admin.passwordHash = await hashPassword(next);
  admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;
  await admin.save();

  const res = ok(true);
  res.cookies.set(sessionCookie(signSession(admin)));
  return res;
});
