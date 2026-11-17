import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { AdminModel } from "@/server/models";
import { hashPassword, passwordProblem, requireAdmin } from "@/server/auth";
import { fail, handle, isSameOrigin, ok, readJson } from "@/server/security";
import { formatZodError } from "@/server/validation";

export const GET = handle(async (req: NextRequest) => {
  await requireAdmin(req, "superadmin");
  await connectDB();
  const admins = await AdminModel.find().sort({ createdAt: 1 }).lean();
  return ok(
    admins.map((a) => ({
      _id: String(a._id),
      name: a.name,
      email: a.email,
      role: a.role,
      lastLoginAt: a.lastLoginAt,
      createdAt: a.createdAt,
    })),
  );
});

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().max(128),
  role: z.enum(["admin", "superadmin"]).default("admin"),
});

export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  await requireAdmin(req, "superadmin");
  const parsed = Body.safeParse(await readJson(req, 4_000));
  if (!parsed.success) return fail(formatZodError(parsed.error));
  const weak = passwordProblem(parsed.data.password);
  if (weak) return fail(weak);
  await connectDB();
  if (await AdminModel.exists({ email: parsed.data.email })) return fail("Email already in use", 409);
  const { password, ...rest } = parsed.data;
  const a = await AdminModel.create({ ...rest, passwordHash: await hashPassword(password) });
  return ok({ _id: String(a._id) }, 201);
});
