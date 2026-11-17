/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "@/app/admins/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────
interface Review {
  _id?: string;
  reviewer_name: string;
  reviewer_role: string;
  reviewer_image: string;
  rating: number;
  review_text: string;
  badge_label?: string;
}

type Tab = "display" | "create";

// ✅ সব API call এখন relative URL — same domain, Vercel এ কাজ করবে
const BASE = "/api/v1/reviews";
const IMGBB_API_KEY = "3f45e45f29d38cd0eb2de6b64f0d42ed"; // তোমার ImgBB key

// ── Auth helper ────────────────────────────────────────────────────────────
const authHeaders = (token?: string | null): HeadersInit =>
  token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

// ── ImgBB upload ───────────────────────────────────────────────────────────
const uploadToImgBB = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: form,
    },
  );
  if (!res.ok) throw new Error("ImgBB upload failed");
  const json = await res.json();
  return json.data.url as string;
};

// ── API layer ──────────────────────────────────────────────────────────────
const api = {
  // ✅ GET /api/v1/reviews
  getAll: async (): Promise<Review[]> => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`Failed to load reviews (${res.status})`);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  },

  // ✅ POST /api/v1/reviews
  create: async (review: Review, token?: string | null): Promise<Review> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(review),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.message ?? `Failed to create review (${res.status})`,
      );
    }
    const json = await res.json();
    return json.data ?? json;
  },

  // ✅ PATCH /api/v1/reviews/:id
  update: async (
    id: string,
    review: Review,
    token?: string | null,
  ): Promise<Review> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(review),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.message ?? `Failed to update review (${res.status})`,
      );
    }
    const json = await res.json();
    return json.data ?? json;
  },

  // ✅ DELETE /api/v1/reviews/:id
  delete: async (id: string, token?: string | null): Promise<void> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.message ?? `Failed to delete review (${res.status})`,
      );
    }
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const emptyReview = (): Review => ({
  reviewer_name: "",
  reviewer_role: "",
  reviewer_image: "",
  rating: 5,
  review_text: "",
  badge_label: "",
});

// ── Shared styles ──────────────────────────────────────────────────────────
const btnBase: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  padding: "11px 18px",
  fontSize: 14,
  fontWeight: 600,
  transition: "opacity .15s",
};

const labelSt: React.CSSProperties = {
  display: "block",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.8,
  marginBottom: 6,
  textTransform: "uppercase",
};

const inp: React.CSSProperties = {
  width: "100%",
  background: "#0f172a",
  border: "1.5px solid #1e3a5f",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

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
      background: type === "success" ? "#0ea5e9" : "#ef4444",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 14,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <span>{type === "success" ? "✓" : "✕"}</span>
    {message}
    <button
      onClick={onClose}
      style={{
        background: "transparent",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        marginLeft: 8,
        fontSize: 16,
      }}
    >
      ×
    </button>
  </div>
);

// ── Star Rating ────────────────────────────────────────────────────────────
interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
}
const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly,
  size = 20,
}) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        onClick={() => !readOnly && onChange?.(s)}
        style={{
          fontSize: size,
          cursor: readOnly ? "default" : "pointer",
          color: s <= value ? "#f59e0b" : "#1e3a5f",
          transition: "color .15s",
          userSelect: "none",
        }}
      >
        ★
      </span>
    ))}
  </div>
);

// ── ReviewForm ─────────────────────────────────────────────────────────────
interface ReviewFormProps {
  initial?: Review;
  onSave: (review: Review) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}
const ReviewForm: React.FC<ReviewFormProps> = ({
  initial,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState<Review>(initial ?? emptyReview());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initial?.reviewer_image ?? "",
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initial ?? emptyReview());
    setImagePreview(initial?.reviewer_image ?? "");
    setImageFile(null);
  }, [initial]);

  const set = (k: keyof Review, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    let imageUrl = form.reviewer_image;
    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadToImgBB(imageFile);
      } catch {
        alert("Image upload failed. Please check your ImgBB API key.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    await onSave({ ...form, reviewer_image: imageUrl });
  };

  const isBusy = loading || uploading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={labelSt}>Reviewer Name</label>
        <input
          style={inp}
          value={form.reviewer_name}
          onChange={(e) => set("reviewer_name", e.target.value)}
          placeholder="e.g. Nadia Rahman"
        />
      </div>

      <div>
        <label style={labelSt}>Role / Company</label>
        <input
          style={inp}
          value={form.reviewer_role}
          onChange={(e) => set("reviewer_role", e.target.value)}
          placeholder="e.g. Marketing Lead, SkinGlow BD"
        />
      </div>

      <div>
        <label style={labelSt}>Review Text</label>
        <textarea
          style={
            {
              ...inp,
              minHeight: 100,
              resize: "vertical",
            } as React.CSSProperties
          }
          value={form.review_text}
          onChange={(e) => set("review_text", e.target.value)}
          placeholder="Write the review content here…"
        />
      </div>

      <div>
        <label style={labelSt}>Star Rating</label>
        <div
          style={{
            background: "#0f172a",
            border: "1.5px solid #1e3a5f",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
        </div>
      </div>

      <div>
        <label style={labelSt}>Badge Label (optional)</label>
        <input
          style={inp}
          value={form.badge_label ?? ""}
          onChange={(e) => set("badge_label", e.target.value)}
          placeholder="e.g. 3× REVENUE"
        />
      </div>

      <div>
        <label style={labelSt}>Reviewer Photo</label>
        <div
          style={{
            background: "#0f172a",
            border: "1.5px solid #1e3a5f",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #0ea5e9",
                flexShrink: 0,
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
                color: "#1e3a5f",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              👤
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label
              htmlFor="reviewer_image_upload"
              style={{
                display: "inline-block",
                cursor: "pointer",
                background: "#0f2744",
                color: "#0ea5e9",
                border: "1.5px solid #0ea5e9",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {imagePreview ? "Change Photo" : "Upload Photo"}
            </label>
            <input
              id="reviewer_image_upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 12 }}>
              Uploaded to ImgBB · JPG, PNG, WEBP
            </p>
            <input
              style={{ ...inp, marginTop: 10, fontSize: 12 }}
              value={form.reviewer_image}
              onChange={(e) => {
                set("reviewer_image", e.target.value);
                setImagePreview(e.target.value);
                setImageFile(null);
              }}
              placeholder="Or paste an image URL directly"
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              ...btnBase,
              flex: 1,
              background: "#1e293b",
              color: "#94a3b8",
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={submit}
          disabled={isBusy}
          style={{
            ...btnBase,
            flex: 2,
            color: "#fff",
            fontWeight: 700,
            background: isBusy
              ? "#0369a1"
              : "linear-gradient(135deg,#0ea5e9,#2563eb)",
            opacity: isBusy ? 0.7 : 1,
          }}
        >
          {uploading
            ? "Uploading image…"
            : loading
              ? "Saving…"
              : initial?._id
                ? "Update Review"
                : "Create Review"}
        </button>
      </div>
    </div>
  );
};

// ── ReviewCard ─────────────────────────────────────────────────────────────
interface CardProps {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
}
const ReviewCard: React.FC<CardProps> = ({ review, onEdit, onDelete }) => (
  <div
    style={{
      background: "#0d1b2e",
      border: "1.5px solid #1e3a5f",
      borderRadius: 16,
      padding: "24px 22px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      position: "relative",
    }}
  >
    <div
      style={{
        fontSize: 32,
        color: "#0ea5e9",
        lineHeight: 1,
        fontFamily: "Georgia, serif",
        marginBottom: -4,
      }}
    >{`"`}</div>
    <StarRating value={review.rating} readOnly size={18} />
    <p
      style={{
        color: "#cbd5e1",
        fontSize: 13,
        lineHeight: 1.7,
        margin: 0,
        flex: 1,
      }}
    >
      {review.review_text}
    </p>
    {review.badge_label && (
      <div
        style={{
          display: "inline-block",
          background: "#0f2744",
          color: "#0ea5e9",
          border: "1px solid #0ea5e9",
          borderRadius: 20,
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          alignSelf: "flex-start",
        }}
      >
        {review.badge_label}
      </div>
    )}
    <div
      style={{
        borderTop: "1px solid #1e3a5f",
        paddingTop: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {review.reviewer_image ? (
        <img
          src={review.reviewer_image}
          alt={review.reviewer_name}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #0ea5e9",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#0f172a",
            border: "2px solid #1e3a5f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          👤
        </div>
      )}
      <div>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>
          {review.reviewer_name}
        </div>
        <div style={{ color: "#64748b", fontSize: 12 }}>
          {review.reviewer_role}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={onEdit}
        style={{
          ...btnBase,
          flex: 1,
          background: "#0f2744",
          color: "#0ea5e9",
          fontSize: 12,
          padding: "8px 0",
        }}
      >
        ✎ Edit
      </button>
      <button
        onClick={onDelete}
        style={{
          ...btnBase,
          flex: 1,
          background: "#1a0a0a",
          color: "#ef4444",
          fontSize: 12,
          padding: "8px 0",
        }}
      >
        ✕ Delete
      </button>
    </div>
  </div>
);

// ── Confirm Dialog ─────────────────────────────────────────────────────────
interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}
const ConfirmDialog: React.FC<ConfirmProps> = ({
  message,
  onConfirm,
  onCancel,
  deleting,
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9998,
    }}
  >
    <div
      style={{
        background: "#0d1b2e",
        border: "1.5px solid #1e3a5f",
        borderRadius: 14,
        padding: "28px 32px",
        maxWidth: 380,
        width: "90%",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
      <p style={{ color: "#e2e8f0", fontSize: 15, marginBottom: 22 }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          disabled={deleting}
          style={{
            ...btnBase,
            flex: 1,
            background: "#1e293b",
            color: "#94a3b8",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          style={{
            ...btnBase,
            flex: 1,
            background: "#7f1d1d",
            color: "#fca5a5",
            fontWeight: 700,
            opacity: deleting ? 0.6 : 1,
          }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const AddReview: React.FC = () => {
  const { token } = useContext(AuthContext);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<Tab>("display");
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load reviews ──────────────────────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    setPageLoading(true);
    try {
      const data = await api.getAll();
      setReviews(data);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to load reviews",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (review: Review) => {
    setFormLoading(true);
    try {
      const created = await api.create(review, token);
      setReviews((prev) => [created, ...prev]); // নতুনটা সামনে আসবে
      setTab("display");
      showToast("Review created successfully!");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to create review",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (review: Review) => {
    if (!editReview?._id) return;
    setFormLoading(true);
    try {
      const updated = await api.update(editReview._id, review, token);
      setReviews((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x)),
      );
      setEditReview(null);
      setTab("display");
      showToast("Review updated successfully!");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update review",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(deleteId, token);
      setReviews((prev) => prev.filter((x) => x._id !== deleteId));
      showToast("Review deleted.");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete review",
        "error",
      );
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const openEdit = (review: Review) => {
    setEditReview(review);
    setTab("create");
  };
  const cancelForm = () => {
    setEditReview(null);
    setTab("display");
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#070d1a", color: "#e2e8f0" }}
    >
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteId && (
        <ConfirmDialog
          message="Are you sure you want to delete this review? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteId(null)}
          deleting={deleting}
        />
      )}

      {/* Page Header */}
      <div
        style={{
          borderBottom: "1px solid #0f2744",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0a1628",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            Customer Reviews
          </h1>
          <p
            style={{ margin: 0, color: "#475569", fontSize: 13, marginTop: 2 }}
          >
            {pageLoading
              ? "Loading…"
              : `${reviews.length} review${reviews.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#0d1b2e",
            border: "1.5px solid #1e3a5f",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {(["display", "create"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === "display") cancelForm();
                else setTab(t);
              }}
              style={{
                ...btnBase,
                borderRadius: 0,
                padding: "9px 22px",
                fontSize: 13,
                background:
                  tab === t
                    ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
                    : "transparent",
                color: tab === t ? "#fff" : "#64748b",
              }}
            >
              {t === "display"
                ? "📋 All Reviews"
                : editReview
                  ? "✎ Edit Review"
                  : "+ New Review"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="py-10 px-6">
        {/* CREATE / EDIT form */}
        {tab === "create" && (
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <div
              style={{
                background: "#0a1628",
                border: "1.5px solid #1e3a5f",
                borderRadius: 16,
                padding: "28px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 22px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 12,
                    color: "#fff",
                  }}
                >
                  {editReview ? "EDIT" : "NEW"}
                </span>
                {editReview ? editReview.reviewer_name : "Create Review"}
              </h2>
              <ReviewForm
                initial={editReview ?? undefined}
                onSave={editReview ? handleUpdate : handleCreate}
                onCancel={cancelForm}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* DISPLAY grid */}
        {tab === "display" && (
          <>
            {pageLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 240,
                  color: "#0ea5e9",
                  fontSize: 15,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                    marginRight: 10,
                    fontSize: 22,
                  }}
                >
                  ◌
                </span>
                Loading reviews…
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: "#475569",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <p style={{ margin: 0, fontSize: 16 }}>No reviews yet.</p>
                <button
                  onClick={() => setTab("create")}
                  style={{
                    ...btnBase,
                    marginTop: 16,
                    background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                    color: "#fff",
                  }}
                >
                  + Add First Review
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                  gap: 24,
                }}
              >
                {reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onEdit={() => openEdit(review)}
                    onDelete={() => setDeleteId(review._id!)}
                  />
                ))}

                {/* Add new card */}
                <div
                  onClick={() => setTab("create")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setTab("create")}
                  style={{
                    background: "#0a1628",
                    border: "2px dashed #1e3a5f",
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    minHeight: 220,
                    cursor: "pointer",
                    color: "#1e3a5f",
                    transition: "border-color .2s, color .2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#0ea5e9";
                    (e.currentTarget as HTMLDivElement).style.color = "#0ea5e9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#1e3a5f";
                    (e.currentTarget as HTMLDivElement).style.color = "#1e3a5f";
                  }}
                >
                  <span style={{ fontSize: 36 }}>+</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    Add New Review
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #0ea5e9 !important; }
        button:hover:not(:disabled) { opacity: 0.88; }
        button:disabled { cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default AddReview;
