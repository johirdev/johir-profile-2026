// useBlogApi.ts
"use client";
import { useContext } from "react";
import { AuthContext } from "@/app/admins/AuthProvider";
import config from "@/app/config/Config";

export type IBlog = {
  _id?: string;
  title: string;
  category: string;
  cover_image: string;
  excerpt: string;
  content: string;
  author_name?: string;
  author_image?: string;
  tags?: string[];
  read_time?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = `/${config.API_URL}/blog`;

const getAuthHeaders = (token?: string | null): HeadersInit =>
  token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

// ── Standalone fetch helpers (usable outside React) ───────────────────────

/** GET /api/v1/blog — public */
export const fetchAllBlogs = async (): Promise<IBlog[]> => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`Failed to load blogs (${res.status})`);
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
};

/** GET /api/v1/blog/:id — public */
export const fetchBlogById = async (id: string): Promise<IBlog> => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch blog (${res.status})`);
  const json = await res.json();
  return json.data ?? json;
};

// ── Hook (provides auth-aware CRUD methods) ───────────────────────────────
export const useBlogApi = () => {
  const { token } = useContext(AuthContext);

  /** GET all */
  const getAll = fetchAllBlogs;

  /** GET one */
  const getOne = fetchBlogById;

  /** POST /api/v1/blog — protected */
  const create = async (blog: IBlog): Promise<IBlog> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(blog),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to create blog (${res.status})`);
    }
    const json = await res.json();
    return json.data ?? json;
  };

  /** PATCH /api/v1/blog/:id — protected */
  const update = async (id: string, blog: Partial<IBlog>): Promise<IBlog> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(blog),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to update blog (${res.status})`);
    }
    const json = await res.json();
    return json.data ?? json;
  };

  /** DELETE /api/v1/blog/:id — protected */
  const remove = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to delete blog (${res.status})`);
    }
  };

  return { getAll, getOne, create, update, remove };
};
