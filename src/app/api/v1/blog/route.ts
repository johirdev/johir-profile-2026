/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/v1/blog/route.ts

import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { createController, listController } from "@/app/controller/blog.controller";
import { NextRequest } from "next/server";

// ── GET /api/v1/blog ──────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    return await listController();
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}

// ── POST /api/v1/blog ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    await connectDB();
    return await createController(req);
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}
