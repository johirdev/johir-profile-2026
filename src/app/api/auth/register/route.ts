import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { AdminModel } from "@/server/models";
import { hashPassword, passwordProblem, sessionCookie, signSession } from "@/server/auth";
import { clientIp, fail, handle, isSameOrigin, ok, rateLimit, readJson } from "@/server/security";
import { formatZodError } from "@/server/validation";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().max(128),
  inviteKey: z.string().max(200),
});

const sameSecret = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Registration is invite-only: the caller must know ADMIN_REGISTRATION_KEY.
 * Without that env var self-registration is switched off and new admins can
 * only be added by the super admin from the dashboard.
 */
export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000).ok) return fail("Too many attempts — try again later", 429);

  const key = process.env.ADMIN_REGISTRATION_KEY;
  if (!key || key.length < 16) return fail("Self-registration is disabled. Ask the site owner for an account.", 403);

  const parsed = Body.safeParse(await readJson(req, 4_000));
  if (!parsed.success) return fail(formatZodError(parsed.error));
  const { name, email, password, inviteKey } = parsed.data;
  if (!sameSecret(inviteKey, key)) return fail("Invalid invite key", 403);
  const weak = passwordProblem(password);
  if (weak) return fail(weak);

  await connectDB();
  if (await AdminModel.exists({ email })) return fail("An account with this email already exists", 409);
  const first = (await AdminModel.estimatedDocumentCount()) === 0;
  const admin = await AdminModel.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: first ? "superadmin" : "admin",
  });

  const res = ok({ name: admin.name, role: admin.role }, 201);
  res.cookies.set(sessionCookie(signSession(admin)));
  return res;
});
