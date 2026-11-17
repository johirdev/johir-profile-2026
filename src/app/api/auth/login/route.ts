import type { NextRequest } from "next/server";
import { connectDB } from "@/server/db";
import { AdminModel } from "@/server/models";
import { hashPassword, sessionCookie, signSession, verifyPassword } from "@/server/auth";
import { clientIp, fail, handle, isSameOrigin, ok, rateLimit, readJson } from "@/server/security";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
// Hash once, then compare against it when the email is unknown so timing does not leak which emails exist.
let dummyHash: Promise<string> | null = null;

export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  const ip = clientIp(req);
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return fail("Too many attempts — try again later", 429, { "Retry-After": String(limit.retryAfter) });

  const body = await readJson<{ email?: unknown; password?: unknown }>(req, 4_000);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 128) : "";
  if (!email || !password) return fail("Email and password are required");

  await connectDB();

  // First run: the owner configured in .env (ADMIN_EMAIL / ADMIN_PASSWORD) becomes the super admin.
  if ((await AdminModel.estimatedDocumentCount()) === 0) {
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD;
    if (envEmail && envPass && email === envEmail && password === envPass) {
      await AdminModel.create({
        name: "Johirul Islam Rasel",
        email,
        passwordHash: await hashPassword(password),
        role: "superadmin",
      });
    }
  }

  const admin = await AdminModel.findOne({ email }).select("+passwordHash");
  const generic = "Invalid email or password";
  if (!admin) {
    await verifyPassword(password, await (dummyHash ??= hashPassword("timing-equaliser")));
    return fail(generic, 401);
  }
  if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
    const mins = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000);
    return fail(`Account locked after too many attempts. Try again in ${mins} min.`, 423);
  }

  if (!(await verifyPassword(password, admin.passwordHash))) {
    admin.failedAttempts = (admin.failedAttempts ?? 0) + 1;
    if (admin.failedAttempts >= MAX_FAILS) {
      admin.lockUntil = new Date(Date.now() + LOCK_MS);
      admin.failedAttempts = 0;
    }
    await admin.save();
    return fail(generic, 401);
  }

  admin.failedAttempts = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  const res = ok({ name: admin.name, email: admin.email, role: admin.role });
  res.cookies.set(sessionCookie(signSession(admin)));
  return res;
});
