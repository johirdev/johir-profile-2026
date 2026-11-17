/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";


import { createReviewService, getAllReviewsService } from "@/app/services/review.service";
import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { ApiError } from "@/app/lib/apiError";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";

// ── GET /api/v1/reviews ──────────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const data = await getAllReviewsService();
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Reviews list",
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

// ── POST /api/v1/reviews ─────────────────────────────────────────────────
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
    const body = await req.json();
    const data = await createReviewService(body);
    return sendResponse({
      statusCode: 201,
      success: true,
      message: "Review created successfully",
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
