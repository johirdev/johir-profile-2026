/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from "@/app/lib/apiError";
import { connectDB } from "@/app/lib/db";
import { getClientIp } from "@/app/lib/getClientIp";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { createAdminService, getAdminsService } from "@/app/services/admin.service";
import { NextRequest } from "next/server";


// ── GET /api/v1/admins ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    await connectDB();
    const data = await getAdminsService();
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "All admins fetched successfully",
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

// ── POST /api/v1/admins ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // const auth = verifyTokenAndRole(req, ["superadmin"]);
  // if (!auth.success)
  //   return sendResponse({
  //     statusCode: 401,
  //     success: false,
  //     message: auth.message,
  //   });

  try {
    await connectDB();
    const body = await req.json();
    const ip = getClientIp(req);
    const data = await createAdminService(body, ip);
    return sendResponse({
      statusCode: 201,
      success: true,
      message: "Admin created successfully",
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
