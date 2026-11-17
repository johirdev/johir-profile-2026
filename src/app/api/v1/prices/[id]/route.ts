/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { PriceModel } from "@/app/models/price.model";
import { NextRequest } from "next/server";

// ✅ Next.js 15 — params is now a Promise
type Params = { params: Promise<{ id: string }> };

// ── GET /api/v1/prices/:id ───────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params; // ✅
  try {
    await connectDB();
    const doc = await PriceModel.findById(id).lean();
    if (!doc)
      return sendResponse({
        statusCode: 404,
        success: false,
        message: "Pricing plan not found",
      });
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Pricing plan fetched",
      data: doc,
    });
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}

// ── PATCH /api/v1/prices/:id ─────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params; // ✅
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
    const payload: Record<string, any> = {};

    if (body.price_heading !== undefined)
      payload.price_heading = String(body.price_heading).trim();
    if (body.price_amount !== undefined)
      payload.price_amount = Number(body.price_amount);
    if (body.active_mostpopular !== undefined)
      payload.active_mostpopular =
        body.active_mostpopular === "true" || body.active_mostpopular === true;
    if (body.contact !== undefined)
      payload.contact = String(body.contact).trim();
    if (body.features !== undefined)
      payload.features = Array.isArray(body.features)
        ? body.features
        : [body.features];

    const updated = await PriceModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return sendResponse({
        statusCode: 404,
        success: false,
        message: "Pricing plan not found",
      });

    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Pricing plan updated",
      data: updated.toObject(),
    });
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}

// ── DELETE /api/v1/prices/:id ────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params; // ✅
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success)
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });

  try {
    await connectDB();
    const removed = await PriceModel.findByIdAndDelete(id);
    if (!removed)
      return sendResponse({
        statusCode: 404,
        success: false,
        message: "Pricing plan not found",
      });

    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Pricing plan deleted",
      data: removed.toObject(),
    });
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}
