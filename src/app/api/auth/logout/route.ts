import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getSession } from "@/server/auth";
import { connectDB } from "@/server/db";
import { AdminModel } from "@/server/models";
import { fail, handle, isSameOrigin, ok } from "@/server/security";

/** POST /api/auth/logout?everywhere=1 also revokes every other session. */
export const POST = handle(async (req: NextRequest) => {
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);
  if (req.nextUrl.searchParams.get("everywhere") === "1") {
    const session = await getSession();
    if (session) {
      await connectDB();
      await AdminModel.updateOne({ _id: session.id }, { $inc: { tokenVersion: 1 } });
    }
  }
  const res = ok(true);
  res.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
});
