/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type StartProjectPayload = {
  name: string;
  email: string;
  contact?: string;
  whatsapp?: string;
  companyOrDomain?: string;
  country?: string;
  category?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  details?: string;
};

type SubmitState = {
  loading: boolean;
  success: boolean;
  error: string | null;
  retryAfterMinutes?: number;
};

// ── useStartProject: submit the start-project form ─────────────────────────
export function useStartProject() {
  const [state, setState] = useState<SubmitState>({
    loading: false,
    success: false,
    error: null,
  });

  async function submitStartProject(payload: StartProjectPayload) {
    setState({ loading: true, success: false, error: null });

    try {
      const res = await fetch("/api/v1/start-project", {
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

  return { ...state, submitStartProject, reset };
}

// ── useStartProjectList: fetch all (admin) ─────────────────────────────────
export type StartProjectListQuery = {
  email?: string;
  country?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

type StartProjectListState = {
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

export function useStartProjectList() {
  const [state, setState] = useState<StartProjectListState>({
    data: [],
    meta: null,
    loading: false,
    error: null,
  });

  async function fetchStartProjects(query: StartProjectListQuery = {}) {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params.set(k, String(v));
      });

      const res = await fetch(`/api/v1/start-project?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: json.message ?? "Failed to fetch project requests",
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

  return { ...state, fetchStartProjects };
}

// ── useDeleteStartProject: delete a project request (admin) ────────────────
export function useDeleteStartProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteStartProject(id: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/start-project/${id}`, {
        method: "DELETE",
      });
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

  return { loading, error, deleteStartProject };
}
