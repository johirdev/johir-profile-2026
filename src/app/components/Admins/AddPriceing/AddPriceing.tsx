/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import config from "@/app/config/Config";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "@/app/admins/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────
interface PricingPlan {
  _id?: string;
  price_heading: string;
  price_amount: number;
  active_mostpopular: boolean;
  contact: string;
  features: string[];
}

type Tab = "display" | "create";

const API_BASE = `/${config.API_URL}/prices`;

// ── Auth helper ────────────────────────────────────────────────────────────
const getAuthHeaders = (token?: string | null): HeadersInit => {
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

// ── API layer ──────────────────────────────────────────────────────────────
const api = {
  /** GET /prices  — public */
  getAll: async (): Promise<PricingPlan[]> => {
    const res = await fetch(API_BASE, { method: "GET" });
    if (!res.ok) throw new Error(`Failed to load plans (${res.status})`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? json.result ?? []);
  },

  /** GET /prices/:id — public */
  getOne: async (id: string): Promise<PricingPlan> => {
    const res = await fetch(`${API_BASE}/${id}`, { method: "GET" });
    if (!res.ok) throw new Error(`Failed to fetch plan (${res.status})`);
    const json = await res.json();
    return json.data ?? json;
  },

  /**
   * POST /prices — protected
   * ✅ Fixed: was hitting /prices/create (405). Backend route is POST /prices.
   * ✅ Fixed: was sending FormData. Backend uses req.json(), so send JSON.
   */
  create: async (
    plan: PricingPlan,
    token?: string | null,
  ): Promise<PricingPlan> => {
    const res = await fetch(API_BASE, {
      // ← /prices, not /prices/create
      method: "POST",
      headers: getAuthHeaders(token), // ← Content-Type: application/json
      body: JSON.stringify({
        price_heading: plan.price_heading,
        price_amount: plan.price_amount,
        active_mostpopular: plan.active_mostpopular,
        contact: plan.contact,
        features: plan.features,
      }),
    });

    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to create plan (${res.status})`);
    }

    const json = await res.json();
    return json.data ?? json;
  },

  /**
   * PATCH /prices/:id — protected
   * ✅ Fixed: was sending FormData. Backend uses req.json(), so send JSON.
   */
  update: async (
    id: string,
    plan: PricingPlan,
    token?: string | null,
  ): Promise<PricingPlan> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(token), // ← Content-Type: application/json
      body: JSON.stringify({
        price_heading: plan.price_heading,
        price_amount: plan.price_amount,
        active_mostpopular: plan.active_mostpopular,
        contact: plan.contact,
        features: plan.features,
      }),
    });

    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to update plan (${res.status})`);
    }

    const json = await res.json();
    return json.data ?? json;
  },

  /**
   * DELETE /prices/:id — protected
   * ✅ Fixed: was hitting /prices/delete/:id (404). Backend route is DELETE /prices/:id.
   */
  delete: async (id: string, token?: string | null): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      // ← /prices/:id, not /prices/delete/:id
      method: "DELETE",
      headers: getAuthHeaders(token),
    });

    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to delete plan (${res.status})`);
    }
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const emptyPlan = (): PricingPlan => ({
  price_heading: "",
  price_amount: 0,
  active_mostpopular: false,
  contact: "",
  features: [""],
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

// ── PlanForm ───────────────────────────────────────────────────────────────
interface PlanFormProps {
  initial?: PricingPlan;
  onSave: (plan: PricingPlan) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}
const PlanForm: React.FC<PlanFormProps> = ({
  initial,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState<PricingPlan>(initial ?? emptyPlan());

  useEffect(() => {
    setForm(initial ?? emptyPlan());
  }, [initial]);

  const set = (k: keyof PricingPlan, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const updateFeature = (i: number, v: string) => {
    const f = [...form.features];
    f[i] = v;
    set("features", f);
  };
  const addFeature = () => set("features", [...form.features, ""]);
  const removeFeature = (i: number) =>
    set(
      "features",
      form.features.filter((_, idx) => idx !== i),
    );

  const submit = async () => {
    const clean = {
      ...form,
      features: form.features.filter((f) => f.trim() !== ""),
    };
    await onSave(clean);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Heading */}
      <div>
        <label style={labelSt}>Plan Heading</label>
        <input
          style={inp}
          value={form.price_heading}
          onChange={(e) => set("price_heading", e.target.value)}
          placeholder="e.g. Business Pro"
        />
      </div>

      {/* Amount */}
      <div>
        <label style={labelSt}>Price Amount ($)</label>
        <input
          style={inp}
          type="number"
          min={0}
          value={form.price_amount}
          onChange={(e) => set("price_amount", Number(e.target.value))}
          placeholder="e.g. 599"
        />
      </div>

      {/* Contact */}
      <div>
        <label style={labelSt}>Contact (URL or text)</label>
        <input
          style={inp}
          value={form.contact}
          onChange={(e) => set("contact", e.target.value)}
          placeholder="e.g. https://wa.me/... or email"
        />
      </div>

      {/* Most Popular Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#0f172a",
          border: "1.5px solid #1e3a5f",
          borderRadius: 8,
          padding: "12px 16px",
        }}
      >
        <div
          onClick={() => set("active_mostpopular", !form.active_mostpopular)}
          role="switch"
          aria-checked={form.active_mostpopular}
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === " " && set("active_mostpopular", !form.active_mostpopular)
          }
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: form.active_mostpopular ? "#0ea5e9" : "#1e293b",
            position: "relative",
            cursor: "pointer",
            transition: "background .2s",
            flexShrink: 0,
            border: "1.5px solid #1e3a5f",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#fff",
              position: "absolute",
              top: 2,
              left: form.active_mostpopular ? 22 : 2,
              transition: "left .2s",
            }}
          />
        </div>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>
          Mark as{" "}
          <span style={{ color: "#0ea5e9", fontWeight: 600 }}>
            Most Popular
          </span>
        </span>
      </div>

      {/* Features */}
      <div>
        <label style={labelSt}>Features</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {form.features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...inp, flex: 1 }}
                value={f}
                onChange={(e) => updateFeature(i, e.target.value)}
                placeholder={`Feature ${i + 1}`}
              />
              <button
                onClick={() => removeFeature(i)}
                style={{
                  ...btnBase,
                  background: "#1e293b",
                  color: "#ef4444",
                  padding: "0 14px",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addFeature}
            style={{
              ...btnBase,
              background: "#0f2744",
              color: "#0ea5e9",
              border: "1.5px dashed #0ea5e9",
              fontSize: 13,
              padding: "9px 0",
            }}
          >
            + Add Feature
          </button>
        </div>
      </div>

      {/* Actions */}
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
          disabled={loading}
          style={{
            ...btnBase,
            flex: 2,
            background: loading
              ? "#0369a1"
              : "linear-gradient(135deg,#0ea5e9,#2563eb)",
            color: "#fff",
            fontWeight: 700,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving…" : initial?._id ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </div>
  );
};

// ── PricingCard ────────────────────────────────────────────────────────────
interface CardProps {
  plan: PricingPlan;
  onEdit: () => void;
  onDelete: () => void;
}
const PricingCard: React.FC<CardProps> = ({ plan, onEdit, onDelete }) => (
  <div
    style={{
      background: "#0d1b2e",
      border: plan.active_mostpopular
        ? "2px solid #0ea5e9"
        : "1.5px solid #1e3a5f",
      borderRadius: 16,
      padding: "28px 24px 20px",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      boxShadow: plan.active_mostpopular
        ? "0 0 32px rgba(14,165,233,0.18)"
        : "none",
      transition: "box-shadow .2s",
    }}
  >
    {plan.active_mostpopular && (
      <div
        style={{
          position: "absolute",
          top: -16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          padding: "5px 18px",
          borderRadius: 20,
          whiteSpace: "nowrap",
        }}
      >
        ✦ MOST POPULAR
      </div>
    )}

    <div
      style={{
        color: "#e2e8f0",
        fontWeight: 700,
        fontSize: 17,
        marginBottom: 10,
      }}
    >
      {plan.price_heading}
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 4,
        marginBottom: 16,
      }}
    >
      <span style={{ color: "#0ea5e9", fontSize: 38, fontWeight: 800 }}>
        ${plan.price_amount.toLocaleString()}
      </span>
      <span style={{ color: "#64748b", fontSize: 13 }}>/package</span>
    </div>

    <div
      style={{
        borderTop: "1px solid #1e3a5f",
        paddingTop: 14,
        marginBottom: 14,
        display: "flex",
        flexDirection: "column",
        gap: 7,
        flex: 1,
      }}
    >
      {plan.features.map((f, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
        >
          <span
            style={{
              color: "#0ea5e9",
              marginTop: 1,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            ✓
          </span>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>{f}</span>
        </div>
      ))}
    </div>

    {plan.contact && (
      <a
        href={plan.contact}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          background: plan.active_mostpopular
            ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
            : "transparent",
          border: plan.active_mostpopular ? "none" : "1.5px solid #1e3a5f",
          color: plan.active_mostpopular ? "#fff" : "#94a3b8",
          borderRadius: 8,
          padding: "11px 0",
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
          marginBottom: 12,
        }}
      >
        Contact Now
      </a>
    )}

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
const AddPricing: React.FC = () => {
  const { token } = useContext(AuthContext);

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [tab, setTab] = useState<Tab>("display");
  const [editPlan, setEditPlan] = useState<PricingPlan | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load all plans ─────────────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    setPageLoading(true);
    try {
      const data = await api.getAll();
      setPlans(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load plans";
      showToast(message, "error");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // ── Create ─────────────────────────────────────────────────────────────
  const handleCreate = async (plan: PricingPlan) => {
    setFormLoading(true);
    try {
      const created = await api.create(plan, token);
      setPlans((prev) => [...prev, created]);
      setTab("display");
      showToast("Plan created successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create plan";
      showToast(message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────
  const handleUpdate = async (plan: PricingPlan) => {
    if (!editPlan?._id) return;
    setFormLoading(true);
    try {
      const updated = await api.update(editPlan._id, plan, token);
      setPlans((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x)),
      );
      setEditPlan(null);
      setTab("display");
      showToast("Plan updated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update plan";
      showToast(message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(deleteId, token);
      setPlans((prev) => prev.filter((x) => x._id !== deleteId));
      showToast("Plan deleted.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete plan";
      showToast(message, "error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const openEdit = (plan: PricingPlan) => {
    setEditPlan(plan);
    setTab("create");
  };

  const cancelForm = () => {
    setEditPlan(null);
    setTab("display");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070d1a",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
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
      {deleteId && (
        <ConfirmDialog
          message="Are you sure you want to delete this pricing plan? This cannot be undone."
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
            Pricing Plans
          </h1>
          <p
            style={{ margin: 0, color: "#475569", fontSize: 13, marginTop: 2 }}
          >
            {pageLoading
              ? "Loading…"
              : `${plans.length} plan${plans.length !== 1 ? "s" : ""} configured`}
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
                ? "📋 All Plans"
                : editPlan
                  ? "✎ Edit Plan"
                  : "+ New Plan"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="py-10">
        {/* CREATE / EDIT */}
        {tab === "create" && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
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
                  {editPlan ? "EDIT" : "NEW"}
                </span>
                {editPlan ? editPlan.price_heading : "Create Pricing Plan"}
              </h2>
              <PlanForm
                initial={editPlan ?? undefined}
                onSave={editPlan ? handleUpdate : handleCreate}
                onCancel={cancelForm}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* DISPLAY */}
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
                Loading plans…
              </div>
            ) : plans.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: "#475569",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
                <p style={{ margin: 0, fontSize: 16 }}>No pricing plans yet.</p>
                <button
                  onClick={() => setTab("create")}
                  style={{
                    ...btnBase,
                    marginTop: 16,
                    background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                    color: "#fff",
                  }}
                >
                  + Create First Plan
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: 24,
                }}
              >
                {plans.map((plan) => (
                  <PricingCard
                    key={plan._id}
                    plan={plan}
                    onEdit={() => openEdit(plan)}
                    onDelete={() => setDeleteId(plan._id!)}
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
                    Add New Plan
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
        input:focus { border-color: #0ea5e9 !important; }
        button:hover:not(:disabled) { opacity: 0.88; }
        button:disabled { cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default AddPricing;
