// app/api/v1/project/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/app/lib/db";
import { sendResponse } from "@/app/lib/sendResponse";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";
import { ProjectModel } from "@/app/models/portfolio.model";
import { NextRequest } from "next/server";

// ── Types ──────────────────────────────────────────────────────────────────
type ProjectCategory =
  | "Web Apps"
  | "Mobile Apps"
  | "E-Commerce"
  | "SaaS"
  | "UI/UX Design"
  | "Digital Marketing"
  | "Video Editing";

const CATEGORIES: ProjectCategory[] = [
  "Web Apps",
  "Mobile Apps",
  "E-Commerce",
  "SaaS",
  "UI/UX Design",
  "Digital Marketing",
  "Video Editing",
];

// ── Helpers ────────────────────────────────────────────────────────────────
const parseCategory = (val: any): ProjectCategory =>
  CATEGORIES.includes(val) ? val : "Web Apps";

const parseTags = (val: any): string[] => {
  if (Array.isArray(val))
    return val.map((t) => String(t).trim()).filter(Boolean);
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
};

const parseTechStack = (val: any): { name: string; slug?: string }[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((t) => {
      if (typeof t === "string") {
        const name = t.trim();
        return name ? { name } : null;
      }
      if (t && typeof t === "object" && t.name) {
        const name = String(t.name).trim();
        if (!name) return null;
        return {
          name,
          slug: t.slug ? String(t.slug).trim() : undefined,
        };
      }
      return null;
    })
    .filter((t): t is { name: string; slug?: string } => !!t);
};

const parseBool = (val: any): boolean => val === true || val === "true";

// Next.js 15 — params is a Promise
type Params = { params: Promise<{ id: string }> };

// ── GET /api/v1/project/:id ────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await connectDB();
    const doc = await ProjectModel.findById(id).lean();
    if (!doc) {
      return sendResponse({
        statusCode: 404,
        success: false,
        message: "Project not found",
      });
    }
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Project fetched successfully",
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

// ── PATCH /api/v1/project/:id ──────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;

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
    const payload: Record<string, any> = {};

    if (body.title !== undefined) payload.title = String(body.title).trim();
    if (body.category !== undefined)
      payload.category = parseCategory(body.category);
    if (body.summary !== undefined)
      payload.summary = String(body.summary).trim();
    if (body.problem_statement !== undefined)
      payload.problem_statement = String(body.problem_statement).trim();
    if (body.description !== undefined)
      payload.description = String(body.description).trim();
    if (body.client_name !== undefined)
      payload.client_name = String(body.client_name).trim();
    if (body.cover_image !== undefined)
      payload.cover_image = String(body.cover_image).trim();
    if (body.image_2 !== undefined)
      payload.image_2 = String(body.image_2).trim();
    if (body.image_3 !== undefined)
      payload.image_3 = String(body.image_3).trim();
    if (body.tech_stack !== undefined)
      payload.tech_stack = parseTechStack(body.tech_stack);
    if (body.live_url !== undefined)
      payload.live_url = String(body.live_url).trim();
    if (body.github_url !== undefined)
      payload.github_url = String(body.github_url).trim();
    if (body.tags !== undefined) payload.tags = parseTags(body.tags);
    if (body.featured !== undefined)
      payload.featured = parseBool(body.featured);

    const updated = await ProjectModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendResponse({
        statusCode: 404,
        success: false,
        message: "Project not found",
      });
    }

    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Project updated successfully",
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

// ── DELETE /api/v1/project/:id ─────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;

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
    const removed = await ProjectModel.findByIdAndDelete(id);
    if (!removed) {
      return sendResponse({
        statusCode: 404,
        success: false,
        message: "Project not found",
      });
    }

    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Project deleted successfully",
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
