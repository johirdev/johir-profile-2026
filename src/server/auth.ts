import "server-only";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { connectDB } from "./db";
import { AdminModel, type AdminDoc } from "./models";
import { HttpError } from "./security";

export const SESSION_COOKIE = "pf_session";
/** One login lasts exactly one week, then the admin must sign in again. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

interface Claims {
  sub: string;
  role: AdminDoc["role"];
  /** Bumped on password change / logout-everywhere → old tokens die. */
  tv: number;
}

export interface Session {
  id: string;
  name: string;
  email: string;
  role: AdminDoc["role"];
}

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters");
  return s;
}

export function signSession(admin: Pick<AdminDoc, "_id" | "role" | "tokenVersion">) {
  const claims: Claims = { sub: String(admin._id), role: admin.role, tv: admin.tokenVersion ?? 0 };
  return jwt.sign(claims, secret(), {
    algorithm: "HS256",
    expiresIn: SESSION_TTL_SECONDS,
    issuer: "johir-portfolio",
    audience: "admin",
  });
}

export const sessionCookie = (token: string) => ({
  name: SESSION_COOKIE,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  priority: "high" as const,
});

/** Verifies the token AND that the admin still exists with the same token version. */
async function sessionFromToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  let claims: Claims;
  try {
    claims = jwt.verify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "johir-portfolio",
      audience: "admin",
    }) as unknown as Claims;
  } catch {
    return null;
  }
  if (!/^[0-9a-f]{24}$/i.test(claims.sub)) return null;
  await connectDB();
  const admin = await AdminModel.findById(claims.sub).lean();
  if (!admin || (admin.tokenVersion ?? 0) !== claims.tv) return null;
  return { id: String(admin._id), name: admin.name, email: admin.email, role: admin.role };
}

/** For server components / layouts. */
export async function getSession() {
  const jar = await cookies();
  try {
    return await sessionFromToken(jar.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

/** For route handlers — throws 401/403. */
export async function requireAdmin(req: NextRequest, role: AdminDoc["role"] | "any" = "any") {
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const session = await sessionFromToken(req.cookies.get(SESSION_COOKIE)?.value ?? bearer);
  if (!session) throw new HttpError(401, "Your session has expired — please sign in again");
  if (role === "superadmin" && session.role !== "superadmin") {
    throw new HttpError(403, "Only the super admin can do that");
  }
  return session;
}

export const hashPassword = (pw: string) =>
  bcrypt.hash(pw, Math.min(14, Math.max(10, Number(process.env.BCRYPT_SALT_ROUND) || 12)));
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

/** ≥10 chars with at least one letter and one number. */
export function passwordProblem(pw: string): string | null {
  if (typeof pw !== "string" || pw.length < 10) return "Password must be at least 10 characters";
  if (pw.length > 128) return "Password is too long";
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return "Password needs at least one letter and one number";
  return null;
}
