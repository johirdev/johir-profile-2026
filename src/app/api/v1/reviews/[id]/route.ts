/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { ApiError } from "@/app/lib/apiError";
import {
  getReviewService,
  updateReviewService,
  deleteReviewService,
} from "@/app/services/review.service";


// ✅ Next.js 15 — params এখন Promise
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params; // ✅ await করতে হবে
  try {
    await connectDB();
    const data = await getReviewService(id);
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Review fetched successfully",
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

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params; // ✅ await করতে হবে
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
    const data = await updateReviewService(id, body);
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Review updated successfully",
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

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params; // ✅ await করতে হবে
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    await connectDB();
    const data = await deleteReviewService(id);
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Review deleted successfully",
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
