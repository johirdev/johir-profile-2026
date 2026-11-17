/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/v1/blog/[id]/route.ts
import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import {
  getController,
  updateController,
  deleteController,
} from "@/app/controller/blog.controller";

import { NextRequest } from "next/server";

// Next.js 15 — params is a Promise
type Params = { params: Promise<{ id: string }> };

// ── GET /api/v1/blog/:id ──────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await connectDB();
    return await getController(id);
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}

// ── PATCH /api/v1/blog/:id ────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    await connectDB();
    return await updateController(req, id);
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}

// ── DELETE /api/v1/blog/:id ───────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    await connectDB();
    return await deleteController(id);
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}
