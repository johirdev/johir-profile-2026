/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/start-project/route.ts
// POST /api/start-project   (public)
// GET  /api/start-project   (admin)

import { NextRequest, NextResponse } from "next/server";
import {
  checkIpRateLimit,
  createStartProject,
  getAllStartProjects,
} from "@/app/services/startaProject.service";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";



// ── Helper: extract real IP ────────────────────────────────────────────────
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ── POST /api/start-project  (public) ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      contact,
      whatsapp,
      companyOrDomain,
      country,
      category,
      budget,
      startDate,
      endDate,
      details,
    } = body;

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
          message: `You have already submitted a project request. Please try again after ${retryAfterMinutes} minutes.`,
          data: { retryAfterMinutes },
        },
        { status: 429 },
      );
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      contact: contact ? String(contact).trim() : undefined,
      whatsapp: whatsapp ? String(whatsapp).trim() : undefined,
      companyOrDomain: companyOrDomain
        ? String(companyOrDomain).trim()
        : undefined,
      country: country ? String(country).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      budget: budget ? String(budget).trim() : undefined,
      startDate: startDate ? String(startDate).trim() : undefined,
      endDate: endDate ? String(endDate).trim() : undefined,
      details: details ? String(details).trim() : undefined,
      ip,
    };

    const result = await createStartProject(payload as any);

    return NextResponse.json(
      {
        success: true,
        message: "Project request submitted successfully",
        data: result,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── GET /api/start-project  (admin) ───────────────────────────────────────
// ?email=&country=&category=&startDate=&endDate=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const auth = verifyTokenAndRole(req, ["admin", "superadmin"]);
    if (!auth.success)
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.message.startsWith("Forbidden") ? 403 : 401 },
      );

    const { searchParams } = req.nextUrl;

    const result = await getAllStartProjects({
      email: searchParams.get("email") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      category: searchParams.get("category") ?? undefined,
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
