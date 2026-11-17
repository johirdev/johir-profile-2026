// blog.controller.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { BlogServices } from "../services/blog.service";

// ── Helpers ────────────────────────────────────────────────────────────────
const parseTags = (val: any): string[] => {
  if (Array.isArray(val))
    return val.map((t) => String(t).trim()).filter(Boolean);
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
};

const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ok = (data: any, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── GET ALL ────────────────────────────────────────────────────────────────
export const listController = async () => {
  const docs = await BlogServices.getAllService();
  return ok(docs);
};

// ── GET ONE ────────────────────────────────────────────────────────────────
export const getController = async (id: string) => {
  const doc = await BlogServices.getService(id);
  if (!doc) return fail("Blog not found", 404);
  return ok(doc);
};

// ── CREATE ─────────────────────────────────────────────────────────────────
export const createController = async (req: NextRequest) => {
  const body = await req.json();
  const { title, category, cover_image, excerpt, content } = body;

  if (!title || !category || !cover_image || !excerpt || !content) {
    return fail(
      "title, category, cover_image, excerpt and content are required",
    );
  }

  const payload = {
    title: String(title).trim(),
    category: String(category).trim(),
    cover_image: String(cover_image).trim(),
    excerpt: String(excerpt).trim(),
    content: String(content),
    author_name: body.author_name ? String(body.author_name).trim() : "",
    author_image: body.author_image ? String(body.author_image).trim() : "",
    tags: parseTags(body.tags),
    read_time: body.read_time ? String(body.read_time).trim() : "",
    slug: body.slug ? String(body.slug).trim() : slugify(String(title)),
  };

  const result = await BlogServices.createService(payload as any);
  return ok(result, 201);
};

// ── UPDATE ─────────────────────────────────────────────────────────────────
export const updateController = async (req: NextRequest, id: string) => {
  const body = await req.json();
  const payload: Record<string, any> = {};

  if (body.title !== undefined) payload.title = String(body.title).trim();
  if (body.category !== undefined)
    payload.category = String(body.category).trim();
  if (body.cover_image !== undefined)
    payload.cover_image = String(body.cover_image).trim();
  if (body.excerpt !== undefined) payload.excerpt = String(body.excerpt).trim();
  if (body.content !== undefined) payload.content = String(body.content);
  if (body.author_name !== undefined)
    payload.author_name = String(body.author_name).trim();
  if (body.author_image !== undefined)
    payload.author_image = String(body.author_image).trim();
  if (body.tags !== undefined) payload.tags = parseTags(body.tags);
  if (body.read_time !== undefined)
    payload.read_time = String(body.read_time).trim();
  if (body.slug !== undefined) payload.slug = String(body.slug).trim();

  const updated = await BlogServices.updateService(id, payload);
  if (!updated) return fail("Blog not found", 404);
  return ok(updated);
};

// ── DELETE ─────────────────────────────────────────────────────────────────
export const deleteController = async (id: string) => {
  const removed = await BlogServices.deleteService(id);
  if (!removed) return fail("Blog not found", 404);
  return ok(removed);
};
