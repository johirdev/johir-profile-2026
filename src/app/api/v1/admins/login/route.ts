/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from "@/app/lib/apiError";
import { connectDB } from "@/app/lib/db";
import { getClientIp } from "@/app/lib/getClientIp";
import { sendResponse } from "@/app/lib/sendResponse";
import { loginAdminService } from "@/app/services/admin.service";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const ip = getClientIp(req);

    const result = await loginAdminService({
      admin_email: body.admin_email,
      admin_password: body.admin_password,
      sendingDeviceIp: ip,
    });

    // refresh token cookie সেট করো
    const response = sendResponse({
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { access_token: result.access_token },
    });

    response.cookies.set("refreshToken", result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days (seconds)
      path: "/",
    });

    return response;
  } catch (err: any) {
    const status = err instanceof ApiError ? err.statusCode : 500;
    return sendResponse({
      statusCode: status,
      success: false,
      message: err.message,
    });
  }
}
