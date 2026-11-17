"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Shared submit logic for anonymous forms: sends the honeypot + time-on-form
 * signals the API checks, and normalises errors.
 */
export function usePublicForm(endpoint: "contact" | "feedback") {
  const started = useRef(0);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const markStart = useCallback(() => {
    if (!started.current) started.current = Date.now();
  }, []);

  async function submit(values: Record<string, unknown>) {
    setState("sending");
    setError("");
    try {
      const res = await fetch(`/api/public/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, elapsedMs: started.current ? Date.now() - started.current : 0 }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) throw new Error(json.message || "Something went wrong — please try again.");
      setState("sent");
      return true;
    } catch (e) {
      setError((e as Error).message);
      setState("error");
      return false;
    }
  }

  return { state, error, submit, markStart, reset: () => setState("idle") };
}
