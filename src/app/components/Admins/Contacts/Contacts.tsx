/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "@/app/admins/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────
interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: number;
  message?: string;
  ip: string;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchParams {
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

// ── Auth headers ───────────────────────────────────────────────────────────
const authHeaders = (token?: string | null): HeadersInit =>
  token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

// ── API layer ──────────────────────────────────────────────────────────────
const api = {
  // GET /api/contact?email=&phone=&startDate=&endDate=&page=&limit=
  getAll: async (params: FetchParams, token?: string | null) => {
    const q = new URLSearchParams();
    if (params.email) q.set("email", params.email);
    if (params.phone) q.set("phone", params.phone);
    if (params.startDate) q.set("startDate", params.startDate);
    if (params.endDate) q.set("endDate", params.endDate);
    q.set("page", String(params.page));
    q.set("limit", String(params.limit));

    const res = await fetch(`/api/v1/contact?${q.toString()}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`Failed to load contacts (${res.status})`);
    const json = await res.json();
    return {
      data: (json.data ?? []) as ContactSubmission[],
      meta: (json.meta ?? {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      }) as Meta,
    };
  },

  // GET /api/contact/:id
  getOne: async (
    id: string,
    token?: string | null,
  ): Promise<ContactSubmission> => {
    const res = await fetch(`/api/v1/contact/${id}`, {
      headers: authHeaders(token),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) throw new Error(`Failed to load contact (${res.status})`);
    const json = await res.json();
    return json.data as ContactSubmission;
  },

  // DELETE /api/contact/:id
  delete: async (id: string, token?: string | null) => {
    const res = await fetch(`/api/v1/contact/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to delete (${res.status})`);
    }
  },
};

// ── Shared styles ──────────────────────────────────────────────────────────
const btnBase: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 600,
  transition: "opacity .15s",
};

const inputSt: React.CSSProperties = {
  background: "#0f172a",
  border: "1.5px solid #1e3a5f",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "9px 13px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// ── Toast ──────────────────────────────────────────────────────────────────
const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  onClose: () => void;
}> = ({ message, type, onClose }) => (
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
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      ×
    </button>
  </div>
);

// ── Confirm Dialog ─────────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}> = ({ onConfirm, onCancel, deleting }) => (
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
      <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
      <p style={{ color: "#e2e8f0", fontSize: 15, marginBottom: 22 }}>
        Are you sure you want to delete this contact submission? This cannot be
        undone.
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

// ── Detail Drawer ──────────────────────────────────────────────────────────
const DetailDrawer: React.FC<{
  contact: ContactSubmission;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
}> = ({ contact, loading, onClose, onDelete }) => {
  const rows: [string, string | number | undefined][] = [
    ["Name", contact.name],
    ["Email", contact.email],
    ["Phone", contact.phone],
    ["Service", contact.service],
    [
      "Budget",
      contact.budget !== undefined
        ? `$${contact.budget.toLocaleString()}`
        : undefined,
    ],
    ["IP Address", contact.ip],
    ["Submitted", new Date(contact.createdAt).toLocaleString()],
    ["Updated", new Date(contact.updatedAt).toLocaleString()],
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 9000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100vw)",
          height: "100vh",
          background: "#0a1628",
          borderLeft: "1.5px solid #1e3a5f",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #0f2744",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#070d1a",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Contact Detail
            </p>
            <h2
              style={{
                margin: "4px 0 0",
                color: "#e2e8f0",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              {contact.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              ...btnBase,
              background: "#1e293b",
              color: "#94a3b8",
              padding: "8px 14px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0ea5e9",
              gap: 10,
              fontSize: 14,
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: "spin 1s linear infinite",
                fontSize: 22,
              }}
            >
              ◌
            </span>
            Loading detail…
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flex: 1,
            }}
          >
            {rows.map(([label, value]) =>
              value !== undefined ? (
                <div
                  key={label}
                  style={{
                    background: "#0d1b2e",
                    border: "1.5px solid #1e3a5f",
                    borderRadius: 10,
                    padding: "12px 16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      color: "#475569",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "#e2e8f0",
                      fontSize: 14,
                      wordBreak: "break-all",
                    }}
                  >
                    {String(value)}
                  </p>
                </div>
              ) : null,
            )}

            {contact.message && (
              <div
                style={{
                  background: "#0d1b2e",
                  border: "1.5px solid #1e3a5f",
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px",
                    color: "#475569",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Message
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {contact.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Delete button */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #0f2744" }}>
          <button
            onClick={onDelete}
            style={{
              ...btnBase,
              width: "100%",
              background: "#1a0a0a",
              color: "#ef4444",
              fontSize: 13,
            }}
          >
            ✕ Delete This Submission
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ─────────────────────────────────────────────────────────────
const Pagination: React.FC<{
  meta: Meta;
  onChange: (page: number) => void;
}> = ({ meta, onChange }) => {
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);
  if (meta.totalPages <= 1) return null;

  const visible = pages.filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1,
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "24px 0 8px",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => onChange(meta.page - 1)}
        disabled={meta.page === 1}
        style={{
          ...btnBase,
          background: "#0d1b2e",
          color: "#64748b",
          padding: "8px 14px",
          border: "1.5px solid #1e3a5f",
          opacity: meta.page === 1 ? 0.4 : 1,
        }}
      >
        ←
      </button>

      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showDots = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showDots && (
              <span
                style={{ color: "#475569", fontSize: 13, padding: "0 4px" }}
              >
                …
              </span>
            )}
            <button
              onClick={() => onChange(p)}
              style={{
                ...btnBase,
                background:
                  p === meta.page
                    ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
                    : "#0d1b2e",
                color: p === meta.page ? "#fff" : "#64748b",
                padding: "8px 14px",
                border: "1.5px solid #1e3a5f",
                minWidth: 40,
              }}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => onChange(meta.page + 1)}
        disabled={meta.page === meta.totalPages}
        style={{
          ...btnBase,
          background: "#0d1b2e",
          color: "#64748b",
          padding: "8px 14px",
          border: "1.5px solid #1e3a5f",
          opacity: meta.page === meta.totalPages ? 0.4 : 1,
        }}
      >
        →
      </button>
    </div>
  );
};

// ── Badge ──────────────────────────────────────────────────────────────────
const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "#0ea5e9",
}) => (
  <span
    style={{
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

// ═════════════════════════════════════════════════════════════════════════════
// ── Main Component ─────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
const Contacts: React.FC = () => {
  const { token } = useContext(AuthContext);

  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailContact, setDetailContact] = useState<ContactSubmission | null>(
    null,
  );
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // Filters
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch list ─────────────────────────────────────────────────────────
  const fetchContacts = useCallback(
    async (params: FetchParams) => {
      setLoading(true);
      try {
        const result = await api.getAll(params, token);
        setContacts(result.data);
        setMeta(result.meta);
      } catch (err: unknown) {
        showToast(
          err instanceof Error ? err.message : "Failed to load",
          "error",
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchContacts({ email, phone, startDate, endDate, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // ── Open detail drawer → fetch full record ─────────────────────────────
  const openDetail = async (c: ContactSubmission) => {
    setDetailContact(c); // optimistic: list data দিয়ে আগেই খোলো
    setDetailLoading(true);
    try {
      const full = await api.getOne(c._id, token);
      setDetailContact(full);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to load detail",
        "error",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Search / filter ────────────────────────────────────────────────────
  const handleSearch = () => {
    setPage(1);
    fetchContacts({ email, phone, startDate, endDate, page: 1, limit });
  };

  const handleReset = () => {
    setEmail("");
    setPhone("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchContacts({ page: 1, limit });
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(deleteId, token);
      setContacts((prev) => prev.filter((c) => c._id !== deleteId));
      setMeta((m) => ({ ...m, total: m.total - 1 }));
      setDetailContact(null);
      showToast("Contact deleted.");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete",
        "error",
      );
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const triggerDelete = (id: string) => {
    setDetailContact(null);
    setDeleteId(id);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{ minHeight: "100vh", background: "#070d1a", color: "#e2e8f0" }}
    >
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm dialog */}
      {deleteId && (
        <ConfirmDialog
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteId(null)}
          deleting={deleting}
        />
      )}

      {/* Detail drawer */}
      {detailContact && (
        <DetailDrawer
          contact={detailContact}
          loading={detailLoading}
          onClose={() => setDetailContact(null)}
          onDelete={() => triggerDelete(detailContact._id)}
        />
      )}

      {/* ── Page Header ── */}
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
            Contact Submissions
          </h1>
          <p style={{ margin: "2px 0 0", color: "#475569", fontSize: 13 }}>
            {loading
              ? "Loading…"
              : `${meta.total} submission${meta.total !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {/* Limit selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#475569", fontSize: 12 }}>Show</span>
          {[10, 20, 50].map((n) => (
            <button
              key={n}
              onClick={() => {
                setLimit(n);
                setPage(1);
              }}
              style={{
                ...btnBase,
                padding: "7px 14px",
                background:
                  limit === n
                    ? "linear-gradient(135deg,#0ea5e9,#2563eb)"
                    : "#0d1b2e",
                color: limit === n ? "#fff" : "#64748b",
                border: "1.5px solid #1e3a5f",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "24px 32px" }}>
        {/* ── Filter Bar ── */}
        <div
          style={{
            background: "#0a1628",
            border: "1.5px solid #1e3a5f",
            borderRadius: 14,
            padding: "20px",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
            alignItems: "flex-end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Search Email
            </label>
            <input
              style={inputSt}
              placeholder="e.g. gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Search Phone
            </label>
            <input
              style={inputSt}
              placeholder="e.g. 0191"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              From Date
            </label>
            <input
              type="date"
              style={{ ...inputSt, colorScheme: "dark" }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#475569",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              To Date
            </label>
            <input
              type="date"
              style={{ ...inputSt, colorScheme: "dark" }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSearch}
              style={{
                ...btnBase,
                flex: 2,
                background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                color: "#fff",
                padding: "10px 0",
              }}
            >
              🔍 Search
            </button>
            <button
              onClick={handleReset}
              style={{
                ...btnBase,
                flex: 1,
                background: "#1e293b",
                color: "#94a3b8",
                padding: "10px 0",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 240,
              color: "#0ea5e9",
              fontSize: 15,
              gap: 10,
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: "spin 1s linear infinite",
                fontSize: 22,
              }}
            >
              ◌
            </span>
            Loading submissions…
          </div>
        ) : contacts.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "80px 0", color: "#475569" }}
          >
            <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
            <p style={{ margin: 0, fontSize: 15 }}>
              No contact submissions found.
            </p>
            {(email || phone || startDate || endDate) && (
              <button
                onClick={handleReset}
                style={{
                  ...btnBase,
                  marginTop: 14,
                  background: "#1e293b",
                  color: "#94a3b8",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                background: "#0a1628",
                border: "1.5px solid #1e3a5f",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 720,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#070d1a",
                        borderBottom: "1px solid #1e3a5f",
                      }}
                    >
                      {[
                        "Name",
                        "Email",
                        "Phone",
                        "Service",
                        "Budget",
                        "Date",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "13px 16px",
                            textAlign: "left",
                            color: "#475569",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr
                        key={c._id}
                        style={{
                          borderBottom:
                            i < contacts.length - 1
                              ? "1px solid #0f2744"
                              : "none",
                          transition: "background .15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLTableRowElement
                          ).style.background = "#0d1b2e")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLTableRowElement
                          ).style.background = "transparent")
                        }
                        onClick={() => openDetail(c)}
                      >
                        {/* Name */}
                        <td
                          style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg,#0ea5e9,#2563eb)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                              }}
                            >
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span
                              style={{
                                color: "#e2e8f0",
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {c.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: "#0ea5e9", fontSize: 13 }}>
                            {c.email}
                          </span>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>
                            {c.phone ?? (
                              <span style={{ color: "#2d4a6a" }}>—</span>
                            )}
                          </span>
                        </td>

                        {/* Service */}
                        <td style={{ padding: "14px 16px" }}>
                          {c.service ? (
                            <Badge>{c.service}</Badge>
                          ) : (
                            <span style={{ color: "#2d4a6a" }}>—</span>
                          )}
                        </td>

                        {/* Budget */}
                        <td
                          style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                        >
                          {c.budget !== undefined ? (
                            <Badge color="#10b981">
                              ${c.budget.toLocaleString()}
                            </Badge>
                          ) : (
                            <span style={{ color: "#2d4a6a" }}>—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td
                          style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                        >
                          <span style={{ color: "#475569", fontSize: 12 }}>
                            {new Date(c.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td
                          style={{ padding: "14px 16px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => openDetail(c)}
                              style={{
                                ...btnBase,
                                background: "#0f2744",
                                color: "#0ea5e9",
                                padding: "7px 12px",
                                fontSize: 12,
                              }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => setDeleteId(c._id)}
                              style={{
                                ...btnBase,
                                background: "#1a0a0a",
                                color: "#ef4444",
                                padding: "7px 12px",
                                fontSize: 12,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <Pagination meta={meta} onChange={(p) => setPage(p)} />

            {/* Summary */}
            <p
              style={{
                textAlign: "center",
                color: "#2d4a6a",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Showing {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus { border-color: #0ea5e9 !important; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { cursor: not-allowed; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  );
};

export default Contacts;
