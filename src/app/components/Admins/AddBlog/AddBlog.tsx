/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "@/app/admins/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Blog {
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
}

type Tab = "display" | "create";

const API_BASE = `/api/v1/blog`;
const IMGBB_API_KEY = "d1c4d5c43ecb47f3f9fdf60f45c9ab11";

// ── Auth helper ────────────────────────────────────────────────────────────
const getAuthHeaders = (token?: string | null): HeadersInit =>
  token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

// ── ImgBB upload ──────────────────────────────────────────────────────────
const uploadToImgBB = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: "POST", body: form },
  );
  if (!res.ok) throw new Error("ImgBB upload failed");
  const json = await res.json();
  return json.data.url as string;
};

// ── API layer (FIXED URLs) ─────────────────────────────────────────────────
const api = {
  getAll: async (): Promise<Blog[]> => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Failed to load blogs (${res.status})`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? json.result ?? []);
  },

  // ✅ POST to /api/v1/blog (not /api/v1/blog/create)
  create: async (blog: Blog, token?: string | null): Promise<Blog> => {
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
  },

  // ✅ PATCH to /api/v1/blog/:id
  update: async (
    id: string,
    blog: Blog,
    token?: string | null,
  ): Promise<Blog> => {
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
  },

  // ✅ DELETE to /api/v1/blog/:id (not /api/v1/blog/delete/:id)
  delete: async (id: string, token?: string | null): Promise<void> => {
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
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const emptyBlog = (): Blog => ({
  title: "",
  category: "",
  cover_image: "",
  excerpt: "",
  content: "",
  author_name: "",
  author_image: "",
  tags: [],
  read_time: "",
  slug: "",
});

// ── Toast ──────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 9999,
      background:
        type === "success"
          ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
          : "linear-gradient(135deg,#ef4444,#b91c1c)",
      color: "#fff",
      padding: "14px 20px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      maxWidth: 360,
      animation: "slideIn .25s ease",
    }}
  >
    <span style={{ fontSize: 18 }}>{type === "success" ? "✓" : "✕"}</span>
    <span style={{ flex: 1 }}>{message}</span>
    <button
      onClick={onClose}
      style={{
        background: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        borderRadius: 6,
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      ×
    </button>
  </div>
);

// ── BlogForm ───────────────────────────────────────────────────────────────
interface FormProps {
  initial?: Blog;
  onSave: (b: Blog) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: required ? "#0ea5e9" : "#64748b",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {label}
      {required && (
        <span
          style={{
            background: "#0ea5e922",
            color: "#0ea5e9",
            borderRadius: 4,
            padding: "1px 5px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          REQ
        </span>
      )}
    </label>
    {children}
  </div>
);

const inputSt: React.CSSProperties = {
  width: "100%",
  background: "#070d1a",
  border: "1.5px solid #1e3a5f",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s",
};

const BlogForm: React.FC<FormProps> = ({
  initial,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState<Blog>(initial ?? emptyBlog());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initial?.cover_image ?? "",
  );
  const [authorFile, setAuthorFile] = useState<File | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string>(
    initial?.author_image ?? "",
  );
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Blog, string>>>({});

  useEffect(() => {
    setForm(initial ?? emptyBlog());
    setImagePreview(initial?.cover_image ?? "");
    setAuthorPreview(initial?.author_image ?? "");
    setImageFile(null);
    setAuthorFile(null);
    setTagInput("");
    setErrors({});
  }, [initial]);

  const set = <K extends keyof Blog>(k: K, v: Blog[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((e) => ({ ...e, cover_image: "" }));
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthorFile(file);
    setAuthorPreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const existing = form.tags ?? [];
    if (!existing.includes(t)) set("tags", [...existing, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    set(
      "tags",
      (form.tags ?? []).filter((t) => t !== tag),
    );

  const validate = (): boolean => {
    const e: Partial<Record<keyof Blog, string>> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.excerpt.trim()) e.excerpt = "Excerpt is required";
    if (!form.content.trim()) e.content = "Content is required";
    if (!form.cover_image && !imageFile)
      e.cover_image = "Cover image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    let coverUrl = form.cover_image;
    let authorUrl = form.author_image;

    if (imageFile || authorFile) setUploading(true);

    if (imageFile) {
      try {
        coverUrl = await uploadToImgBB(imageFile);
      } catch {
        alert("Cover image upload failed. Please check your ImgBB API key.");
        setUploading(false);
        return;
      }
    }
    if (authorFile) {
      try {
        authorUrl = await uploadToImgBB(authorFile);
      } catch {
        alert("Author image upload failed.");
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    await onSave({ ...form, cover_image: coverUrl, author_image: authorUrl });
  };

  const isBusy = loading || uploading;

  const ErrorMsg: React.FC<{ field: keyof Blog }> = ({ field }) =>
    errors[field] ? (
      <span style={{ color: "#ef4444", fontSize: 11, marginTop: 2 }}>
        ⚠ {errors[field]}
      </span>
    ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Required section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "linear-gradient(135deg,#0ea5e910,#2563eb10)",
          border: "1px solid #0ea5e930",
          borderRadius: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>✦</span>
        <span
          style={{
            color: "#0ea5e9",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
          }}
        >
          REQUIRED FIELDS
        </span>
      </div>

      {/* Title */}
      <Field label="Blog Title" required>
        <input
          style={{
            ...inputSt,
            ...(errors.title ? { borderColor: "#ef4444" } : {}),
          }}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. 5 Meta Ads Strategies That Actually Convert"
        />
        <ErrorMsg field="title" />
      </Field>

      {/* Category */}
      <Field label="Category" required>
        <input
          style={{
            ...inputSt,
            ...(errors.category ? { borderColor: "#ef4444" } : {}),
          }}
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="e.g. Meta Ads, Growth Tips, Case Study"
        />
        <ErrorMsg field="category" />
      </Field>

      {/* Excerpt */}
      <Field label="Excerpt" required>
        <textarea
          style={
            {
              ...inputSt,
              minHeight: 80,
              resize: "vertical",
              ...(errors.excerpt ? { borderColor: "#ef4444" } : {}),
            } as React.CSSProperties
          }
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="Short summary shown on the blog card…"
        />
        <ErrorMsg field="excerpt" />
      </Field>

      {/* Content */}
      <Field label="Content (HTML / Markdown)" required>
        <textarea
          style={
            {
              ...inputSt,
              minHeight: 200,
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: 13,
              ...(errors.content ? { borderColor: "#ef4444" } : {}),
            } as React.CSSProperties
          }
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Full blog body…"
        />
        <ErrorMsg field="content" />
      </Field>

      {/* Cover Image */}
      <Field label="Cover Image" required>
        <div
          style={{
            background: "#070d1a",
            border: `1.5px solid ${errors.cover_image ? "#ef4444" : "#1e3a5f"}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {imagePreview ? (
            <div style={{ position: "relative" }}>
              <img
                src={imagePreview}
                alt="Cover preview"
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top,#070d1aaa,transparent)",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                height: 130,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#1e3a5f",
                gap: 8,
                background:
                  "repeating-linear-gradient(45deg,#0a1628,#0a1628 10px,#070d1a 10px,#070d1a 20px)",
              }}
            >
              <span style={{ fontSize: 36 }}>🖼️</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                No image yet
              </span>
            </div>
          )}
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label
                htmlFor="cover_image_upload"
                style={{
                  cursor: "pointer",
                  background: "#0ea5e915",
                  color: "#0ea5e9",
                  border: "1.5px solid #0ea5e950",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  transition: "background .15s",
                }}
              >
                {imagePreview ? "↻ Change" : "↑ Upload"}
              </label>
              <input
                id="cover_image_upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <span style={{ color: "#334155", fontSize: 11 }}>
                JPG · PNG · WEBP · uploaded to ImgBB
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{ color: "#334155", fontSize: 11, whiteSpace: "nowrap" }}
              >
                or URL
              </span>
              <input
                style={{ ...inputSt, fontSize: 12 }}
                value={form.cover_image}
                onChange={(e) => {
                  set("cover_image", e.target.value);
                  setImagePreview(e.target.value);
                  setImageFile(null);
                }}
                placeholder="https://…"
              />
            </div>
          </div>
        </div>
        <ErrorMsg field="cover_image" />
      </Field>

      {/* Optional section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
          padding: "10px 14px",
          background: "#0d1b2e",
          border: "1px solid #1e3a5f",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            color: "#475569",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          OPTIONAL FIELDS
        </span>
      </div>

      {/* Slug + Read time row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Slug">
          <input
            style={inputSt}
            value={form.slug ?? ""}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-generated"
          />
        </Field>
        <Field label="Read Time">
          <input
            style={inputSt}
            value={form.read_time ?? ""}
            onChange={(e) => set("read_time", e.target.value)}
            placeholder="e.g. 5 min read"
          />
        </Field>
      </div>

      {/* Author */}
      <div
        style={{
          background: "#070d1a",
          border: "1.5px solid #1e3a5f",
          borderRadius: 10,
          padding: "16px",
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {authorPreview ? (
            <img
              src={authorPreview}
              alt="Author"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #1e3a5f",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#0d1b2e",
                border: "2px dashed #1e3a5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "#1e3a5f",
              }}
            >
              👤
            </div>
          )}
          <label
            htmlFor="author_image_upload"
            style={{
              display: "block",
              marginTop: 8,
              textAlign: "center",
              cursor: "pointer",
              color: "#0ea5e9",
              fontSize: 10,
              fontWeight: 700,
              background: "#0ea5e915",
              border: "1px solid #0ea5e940",
              borderRadius: 6,
              padding: "4px 6px",
            }}
          >
            {authorPreview ? "Change" : "Upload"}
          </label>
          <input
            id="author_image_upload"
            type="file"
            accept="image/*"
            onChange={handleAuthorChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Author fields */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
        >
          <Field label="Author Name">
            <input
              style={inputSt}
              value={form.author_name ?? ""}
              onChange={(e) => set("author_name", e.target.value)}
              placeholder="e.g. Rafiul Islam"
            />
          </Field>
          <Field label="Author Image URL">
            <input
              style={{ ...inputSt, fontSize: 12 }}
              value={form.author_image ?? ""}
              onChange={(e) => {
                set("author_image", e.target.value);
                setAuthorPreview(e.target.value);
                setAuthorFile(null);
              }}
              placeholder="or paste URL…"
            />
          </Field>
        </div>
      </div>

      {/* Tags */}
      <Field label="Tags">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: (form.tags ?? []).length ? 8 : 0,
          }}
        >
          {(form.tags ?? []).map((tag) => (
            <span
              key={tag}
              style={{
                background: "#0f2744",
                color: "#0ea5e9",
                border: "1px solid #0ea5e940",
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tag}
              <span
                onClick={() => removeTag(tag)}
                style={{
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: 15,
                  lineHeight: 1,
                }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...inputSt, flex: 1 }}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            placeholder="Type a tag and press Enter…"
          />
          <button
            type="button"
            onClick={addTag}
            style={{
              border: "1.5px solid #0ea5e950",
              borderRadius: 8,
              cursor: "pointer",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              background: "#0ea5e915",
              color: "#0ea5e9",
              flexShrink: 0,
              transition: "background .15s",
            }}
          >
            + Add
          </button>
        </div>
      </Field>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isBusy}
            style={{
              border: "1.5px solid #1e3a5f",
              borderRadius: 8,
              cursor: "pointer",
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: "transparent",
              color: "#64748b",
              flex: 1,
              transition: "border-color .15s, color .15s",
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={submit}
          disabled={isBusy}
          style={{
            border: "none",
            borderRadius: 8,
            cursor: isBusy ? "not-allowed" : "pointer",
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            flex: 2,
            background: isBusy
              ? "#0369a1"
              : "linear-gradient(135deg,#0ea5e9,#2563eb)",
            opacity: isBusy ? 0.75 : 1,
            transition: "opacity .15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {uploading ? (
            <>
              <span
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              >
                ◌
              </span>{" "}
              Uploading image…
            </>
          ) : loading ? (
            <>
              <span
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              >
                ◌
              </span>{" "}
              Saving…
            </>
          ) : initial?._id ? (
            "✓ Update Blog Post"
          ) : (
            "+ Create Blog Post"
          )}
        </button>
      </div>
    </div>
  );
};

// ── BlogCard ───────────────────────────────────────────────────────────────
interface CardProps {
  blog: Blog;
  onEdit: () => void;
  onDelete: () => void;
}
const BlogCard: React.FC<CardProps> = ({ blog, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0a1628",
        border: `1.5px solid ${hovered ? "#0ea5e950" : "#1e3a5f"}`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color .2s, transform .2s, box-shadow .2s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(14,165,233,0.08)" : "none",
      }}
    >
      {/* Cover */}
      <div
        style={{
          position: "relative",
          height: 168,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hovered ? "scale(1.03)" : "scale(1)",
              transition: "transform .3s",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "repeating-linear-gradient(45deg,#0d1b2e,#0d1b2e 10px,#0a1628 10px,#0a1628 20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              color: "#1e3a5f",
            }}
          >
            🖼️
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top,#0a1628dd 0%,transparent 60%)",
          }}
        />
        {/* Category badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
            color: "#fff",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {blog.category}
        </div>
        {blog.read_time && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#0a162899",
              backdropFilter: "blur(6px)",
              color: "#94a3b8",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {blog.read_time}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "16px 18px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            color: "#e2e8f0",
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.4,
          }}
        >
          {blog.title}
        </div>
        <p
          style={{
            color: "#64748b",
            fontSize: 12,
            lineHeight: 1.65,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.excerpt}
        </p>

        {/* Tags */}
        {(blog.tags ?? []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {blog.tags!.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#0d1b2e",
                  color: "#475569",
                  borderRadius: 20,
                  padding: "2px 9px",
                  fontSize: 10,
                  fontWeight: 600,
                  border: "1px solid #1e3a5f",
                }}
              >
                {tag}
              </span>
            ))}
            {blog.tags!.length > 4 && (
              <span
                style={{ color: "#334155", fontSize: 10, padding: "2px 0" }}
              >
                +{blog.tags!.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Author */}
        {(blog.author_name || blog.author_image) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: "auto",
              paddingTop: 6,
            }}
          >
            {blog.author_image ? (
              <img
                src={blog.author_image}
                alt={blog.author_name}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1.5px solid #1e3a5f",
                }}
              />
            ) : (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#0d1b2e",
                  border: "1.5px solid #1e3a5f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                👤
              </div>
            )}
            <span style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>
              {blog.author_name}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          borderTop: "1px solid #1e3a5f",
          padding: "12px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <button
          onClick={onEdit}
          style={{
            border: "1.5px solid #0ea5e940",
            borderRadius: 8,
            cursor: "pointer",
            padding: "9px 0",
            fontSize: 12,
            fontWeight: 700,
            background: "#0ea5e910",
            color: "#0ea5e9",
            transition: "background .15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          ✎ Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            border: "1.5px solid #ef444430",
            borderRadius: 8,
            cursor: "pointer",
            padding: "9px 0",
            fontSize: 12,
            fontWeight: 700,
            background: "#ef444410",
            color: "#ef4444",
            transition: "background .15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          ✕ Delete
        </button>
      </div>
    </div>
  );
};

// ── Confirm Dialog ─────────────────────────────────────────────────────────
interface ConfirmProps {
  blogTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}
const ConfirmDialog: React.FC<ConfirmProps> = ({
  blogTitle,
  onConfirm,
  onCancel,
  deleting,
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9998,
      animation: "fadeIn .2s ease",
    }}
  >
    <div
      style={{
        background: "#0a1628",
        border: "1.5px solid #7f1d1d50",
        borderRadius: 16,
        padding: "32px",
        maxWidth: 400,
        width: "90%",
        textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#7f1d1d30",
          border: "1.5px solid #7f1d1d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          margin: "0 auto 16px",
        }}
      >
        🗑️
      </div>
      <p
        style={{
          color: "#e2e8f0",
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Delete this post?
      </p>
      <p
        style={{
          color: "#475569",
          fontSize: 13,
          marginBottom: 8,
          lineHeight: 1.5,
        }}
      >
        &ldquo;{blogTitle}&rdquo;
      </p>
      <p style={{ color: "#334155", fontSize: 12, marginBottom: 24 }}>
        This action cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          disabled={deleting}
          style={{
            flex: 1,
            border: "1.5px solid #1e3a5f",
            borderRadius: 8,
            cursor: "pointer",
            padding: "11px 0",
            fontSize: 14,
            fontWeight: 600,
            background: "transparent",
            color: "#64748b",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          style={{
            flex: 1,
            border: "none",
            borderRadius: 8,
            cursor: deleting ? "not-allowed" : "pointer",
            padding: "11px 0",
            fontSize: 14,
            fontWeight: 700,
            background: "linear-gradient(135deg,#ef4444,#b91c1c)",
            color: "#fff",
            opacity: deleting ? 0.65 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {deleting ? (
            <>
              <span
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              >
                ◌
              </span>{" "}
              Deleting…
            </>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const AddBlog: React.FC = () => {
  const { token } = useContext(AuthContext);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tab, setTab] = useState<Tab>("display");
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [search, setSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBlogs = useCallback(async () => {
    setPageLoading(true);
    try {
      const data = await api.getAll();
      setBlogs(data);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to load blogs",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleCreate = async (blog: Blog) => {
    setFormLoading(true);
    try {
      const created = await api.create(blog, token);
      setBlogs((prev) => [created, ...prev]);
      setTab("display");
      showToast("Blog post published!");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to create blog",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (blog: Blog) => {
    if (!editBlog?._id) return;
    setFormLoading(true);
    try {
      const updated = await api.update(editBlog._id, blog, token);
      setBlogs((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x)),
      );
      setEditBlog(null);
      setTab("display");
      showToast("Blog post updated!");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update blog",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(deleteTarget._id, token);
      setBlogs((prev) => prev.filter((x) => x._id !== deleteTarget._id));
      showToast("Blog post deleted.");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete blog",
        "error",
      );
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openEdit = (b: Blog) => {
    setEditBlog(b);
    setTab("create");
  };
  const cancelForm = () => {
    setEditBlog(null);
    setTab("display");
  };

  const filtered = blogs.filter(
    (b) =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070d1a",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        color: "#e2e8f0",
      }}
    >
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          blogTitle={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* ── Header ── */}
      <div
        style={{
          borderBottom: "1px solid #0f2744",
          padding: "18px 28px",
          background: "#0a1628",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: -0.3,
            }}
          >
            Blog Posts
          </h1>
          <p
            style={{ margin: 0, color: "#334155", fontSize: 12, marginTop: 2 }}
          >
            {pageLoading
              ? "Loading…"
              : `${blogs.length} post${blogs.length !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            background: "#070d1a",
            border: "1.5px solid #1e3a5f",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <button
            onClick={cancelForm}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "9px 20px",
              fontSize: 12,
              fontWeight: 700,
              background:
                tab === "display"
                  ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
                  : "transparent",
              color: tab === "display" ? "#fff" : "#475569",
              transition: "background .2s, color .2s",
            }}
          >
            📋 All Posts
          </button>
          <button
            onClick={() => {
              setEditBlog(null);
              setTab("create");
            }}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "9px 20px",
              fontSize: 12,
              fontWeight: 700,
              background:
                tab === "create"
                  ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
                  : "transparent",
              color: tab === "create" ? "#fff" : "#475569",
              transition: "background .2s, color .2s",
            }}
          >
            {editBlog ? "✎ Edit Post" : "+ New Post"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "28px" }}>
        {/* CREATE / EDIT */}
        {tab === "create" && (
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <div
              style={{
                background: "#0a1628",
                border: "1.5px solid #1e3a5f",
                borderRadius: 16,
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 24,
                  paddingBottom: 18,
                  borderBottom: "1px solid #1e3a5f",
                }}
              >
                <span
                  style={{
                    background: editBlog
                      ? "linear-gradient(135deg,#f59e0b,#d97706)"
                      : "linear-gradient(135deg,#0ea5e9,#2563eb)",
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: 1,
                  }}
                >
                  {editBlog ? "EDITING" : "NEW POST"}
                </span>
                <span
                  style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}
                >
                  {editBlog ? editBlog.title : "Create a new blog post"}
                </span>
              </div>
              <BlogForm
                initial={editBlog ?? undefined}
                onSave={editBlog ? handleUpdate : handleCreate}
                onCancel={cancelForm}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* DISPLAY */}
        {tab === "display" && (
          <>
            {/* Search bar */}
            {!pageLoading && blogs.length > 0 && (
              <div style={{ maxWidth: 380, marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#334155",
                      fontSize: 14,
                    }}
                  >
                    🔍
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or category…"
                    style={{
                      width: "100%",
                      background: "#0a1628",
                      border: "1.5px solid #1e3a5f",
                      borderRadius: 8,
                      color: "#e2e8f0",
                      padding: "10px 14px 10px 36px",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#475569",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                {search && (
                  <p
                    style={{
                      color: "#334155",
                      fontSize: 11,
                      marginTop: 6,
                      marginLeft: 2,
                    }}
                  >
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
                    for &ldquo;{search}&rdquo;
                  </p>
                )}
              </div>
            )}

            {pageLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 260,
                  color: "#0ea5e9",
                  gap: 12,
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    animation: "spin 1s linear infinite",
                    display: "inline-block",
                  }}
                >
                  ◌
                </span>
                <span style={{ fontSize: 14, color: "#334155" }}>
                  Loading blog posts…
                </span>
              </div>
            ) : blogs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  border: "2px dashed #1e3a5f",
                  borderRadius: 16,
                  maxWidth: 400,
                  margin: "0 auto",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#e2e8f0",
                  }}
                >
                  No posts yet
                </p>
                <p
                  style={{ margin: "0 0 20px", fontSize: 13, color: "#334155" }}
                >
                  Create your first blog post to get started.
                </p>
                <button
                  onClick={() => setTab("create")}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: "11px 24px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                  }}
                >
                  + Write First Post
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#334155",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <p style={{ margin: 0, fontSize: 14 }}>
                  No posts match &ldquo;{search}&rdquo;
                </p>
                <button
                  onClick={() => setSearch("")}
                  style={{
                    marginTop: 12,
                    background: "none",
                    border: "1.5px solid #1e3a5f",
                    color: "#64748b",
                    borderRadius: 8,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                  gap: 20,
                }}
              >
                {filtered.map((b) => (
                  <BlogCard
                    key={b._id}
                    blog={b}
                    onEdit={() => openEdit(b)}
                    onDelete={() => setDeleteTarget(b)}
                  />
                ))}

                {/* Add tile */}
                <div
                  onClick={() => {
                    setEditBlog(null);
                    setTab("create");
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setTab("create")}
                  style={{
                    background: "transparent",
                    border: "2px dashed #1e3a5f",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    minHeight: 220,
                    cursor: "pointer",
                    color: "#1e3a5f",
                    transition: "border-color .2s, color .2s, background .2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "#0ea5e9";
                    el.style.color = "#0ea5e9";
                    el.style.background = "#0ea5e908";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "#1e3a5f";
                    el.style.color = "#1e3a5f";
                    el.style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "2px dashed currentColor",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    +
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  >
                    New Post
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #0ea5e9 !important; box-shadow: 0 0 0 3px #0ea5e915; }
        button:hover:not(:disabled) { opacity: 0.88; }
        button:disabled { cursor: not-allowed; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #070d1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default AddBlog;
