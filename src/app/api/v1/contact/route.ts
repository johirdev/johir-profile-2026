/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/contact/route.ts
// POST /api/contact   (public)
// GET  /api/contact   (admin)

import { NextRequest, NextResponse } from "next/server";
import {
  checkIpRateLimit,
  createContact,
  getAllContacts,
} from "@/app/services/contact.service";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";

// ── Helper: extract real IP ────────────────────────────────────────────────
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ── POST /api/contact  (public) ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, budget, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 },
      );
    }

    const ip = getClientIp(req);

    const { blocked, retryAfterMinutes } = await checkIpRateLimit(ip);
    if (blocked) {
      return NextResponse.json(
        {
          success: false,
          message: `You have already sent a message. Please try again after ${retryAfterMinutes} minutes.`,
          data: { retryAfterMinutes },
        },
        { status: 429 },
      );
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      service: service ? String(service).trim() : undefined,
      budget:
        budget !== undefined && budget !== "" ? Number(budget) : undefined,
      message: message ? String(message).trim() : undefined,
      ip,
    };

    const result = await createContact(payload as any);

    return NextResponse.json(
      { success: true, message: "Message sent successfully", data: result },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── GET /api/contact  (admin) ──────────────────────────────────────────────
// ?email=&phone=&startDate=&endDate=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const auth = verifyTokenAndRole(req, ["admin", "superadmin"]);
    if (!auth.success)
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.message.startsWith("Forbidden") ? 403 : 401 },
      );

    const { searchParams } = req.nextUrl;

    const result = await getAllContacts({
      email: searchParams.get("email") ?? undefined,
      phone: searchParams.get("phone") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    });

    return NextResponse.json(
      { success: true, message: "Fetched successfully", ...result },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
