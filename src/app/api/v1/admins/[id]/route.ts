/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiError } from "@/app/lib/apiError";
import { connectDB } from "@/app/lib/db";
import { getClientIp } from "@/app/lib/getClientIp";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { NextRequest } from "next/server";
import {
  getSingleAdminService,
  updateAdminService,
  deleteAdminService,
} from "@/app/services/admin.service";

type Params = { params: { id: string } };

// ── GET /api/v1/admins/:id ───────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyTokenAndRole(req, ["superadmin", "admin", "viewOnly"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    const { id } = await params;
    await connectDB();
    const data = await getSingleAdminService(id);
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Admin fetched successfully",
      data,
    });
  } catch (err: any) {
    const status = err instanceof ApiError ? err.statusCode : 500;
    return sendResponse({
      statusCode: status,
      success: false,
      message: err.message,
    });
  }
}

// ── PATCH /api/v1/admins/:id ─────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyTokenAndRole(req, ["superadmin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const ip = getClientIp(req);
    const data = await updateAdminService(id, body, ip);
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Admin updated successfully",
      data,
    });
  } catch (err: any) {
    const status = err instanceof ApiError ? err.statusCode : 500;
    return sendResponse({
      statusCode: status,
      success: false,
      message: err.message,
    });
  }
}

// ── DELETE /api/v1/admins/:id ────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyTokenAndRole(req, ["superadmin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    const { id } = await params;
    await connectDB();
    await deleteAdminService(id);
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: null,
    });
  } catch (err: any) {
    const status = err instanceof ApiError ? err.statusCode : 500;
    return sendResponse({
      statusCode: status,
      success: false,
      message: err.message,
    });
  }
}
