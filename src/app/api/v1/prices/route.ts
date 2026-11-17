/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { PriceModel } from "@/app/models/price.model";
import { NextRequest } from "next/server";


// ── Helpers ─────────────────────────────────────────────────────────────
const parseFeatures = (body: any): string[] => {
  const raw = body.features;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [raw.trim()].filter(Boolean);
    }
  }
  return [];
};

const parseBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val === "true" || val === "1";
  return Boolean(val);
};

// ── GET /api/v1/prices ───────────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const docs = await PriceModel.find().sort({ price_amount: 1 }).lean();
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Pricing plans list",
      data: docs,
    });
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}

// ── POST /api/v1/prices ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth check
  const auth = verifyTokenAndRole(req, ["superadmin", "admin"]);
  if (!auth.success) {
    return sendResponse({
      statusCode: 401,
      success: false,
      message: auth.message,
    });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { price_heading, price_amount, contact } = body;

    if (!price_heading || price_amount === undefined || !contact) {
      return sendResponse({
        statusCode: 400,
        success: false,
        message: "price_heading, price_amount and contact are required",
      });
    }

    const payload = {
      price_heading: String(price_heading).trim(),
      price_amount: Number(price_amount),
      active_mostpopular: parseBool(body.active_mostpopular),
      contact: String(contact).trim(),
      features: parseFeatures(body),
    };

    const created = await PriceModel.create(payload);
    return sendResponse({
      statusCode: 201,
      success: true,
      message: "Pricing plan created",
      data: created.toObject(),
    });
  } catch (err: any) {
    return sendResponse({
      statusCode: 500,
      success: false,
      message: err.message,
    });
  }
}
