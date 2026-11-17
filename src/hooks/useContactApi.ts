/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: number;
  message?: string;
};

type SubmitState = {
  loading: boolean;
  success: boolean;
  error: string | null;
  retryAfterMinutes?: number;
};

// ── useContact: submit the contact form ────────────────────────────────────
export function useContact() {
  const [state, setState] = useState<SubmitState>({
    loading: false,
    success: false,
    error: null,
  });

  async function submitContact(payload: ContactPayload) {
    setState({ loading: true, success: false, error: null });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          loading: false,
          success: false,
          error: data.message ?? "Something went wrong",
          retryAfterMinutes: data.data?.retryAfterMinutes,
        });
        return;
      }

      setState({ loading: false, success: true, error: null });
    } catch {
      setState({
        loading: false,
        success: false,
        error: "Network error. Please try again.",
      });
    }
  }

  function reset() {
    setState({ loading: false, success: false, error: null });
  }

  return { ...state, submitContact, reset };
}

// ── useContactList: fetch all (admin) ─────────────────────────────────────
export type ContactListQuery = {
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

type ContactListState = {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
};

export function useContactList() {
  const [state, setState] = useState<ContactListState>({
    data: [],
    meta: null,
    loading: false,
    error: null,
  });

  async function fetchContacts(query: ContactListQuery = {}) {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params.set(k, String(v));
      });

      const res = await fetch(`/api/contact?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: json.message ?? "Failed to fetch contacts",
        }));
        return;
      }

      setState({
        data: json.data,
        meta: json.meta,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Network error. Please try again.",
      }));
    }
  }

  return { ...state, fetchContacts };
}

// ── useDeleteContact: delete a contact (admin) ─────────────────────────────
export function useDeleteContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteContact(id: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Delete failed");
        return false;
      }
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, deleteContact };
}
