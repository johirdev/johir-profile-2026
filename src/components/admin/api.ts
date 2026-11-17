"use client";

/** Fetch wrapper for the admin: unwraps `{ ok, data }`, throws readable errors, bounces to login on 401. */
export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: T; message?: string };
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  if (!res.ok || !json.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json.data as T;
}

export async function upload(file: File): Promise<{ url: string; type: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/media", { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: { url: string; type: string }; message?: string };
  if (!res.ok || !json.ok || !json.data) throw new Error(json.message || "Upload failed");
  return json.data;
}
