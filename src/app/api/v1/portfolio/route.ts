// app/api/v1/project/route.ts
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

// ── GET /api/v1/project ────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const docs = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    return sendResponse({
      statusCode: 200,
      success: true,
      message: "Projects list",
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

// ── POST /api/v1/project ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
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
    const { title, category, summary, cover_image } = body;

    if (!title || !category || !summary || !cover_image) {
      return sendResponse({
        statusCode: 400,
        success: false,
        message: "title, category, summary and cover_image are required",
      });
    }

    const payload = {
      title: String(title).trim(),
      category: parseCategory(category),
      summary: String(summary).trim(),
      problem_statement: body.problem_statement
        ? String(body.problem_statement).trim()
        : "",
      description: body.description ? String(body.description).trim() : "",
      client_name: body.client_name ? String(body.client_name).trim() : "",
      cover_image: String(cover_image).trim(),
      image_2: body.image_2 ? String(body.image_2).trim() : "",
      image_3: body.image_3 ? String(body.image_3).trim() : "",
      tech_stack: parseTechStack(body.tech_stack),
      live_url: body.live_url ? String(body.live_url).trim() : "",
      github_url: body.github_url ? String(body.github_url).trim() : "",
      tags: parseTags(body.tags),
      featured: parseBool(body.featured),
    };

    const created = await ProjectModel.create(payload);
    return sendResponse({
      statusCode: 201,
      success: true,
      message: "Project created successfully",
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
