/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/app/lib/store";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string; retryAfterMinutes?: number };

type FormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
};

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  service: "",
  budget: "",
  message: "",
};

// ── API ────────────────────────────────────────────────────────────────────
async function submitContact(
  body: Record<string, string | number>,
): Promise<{ ok: boolean; status: number; json: any }> {
  const res = await fetch("/api/v1/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

// ── Icons (inline, no extra deps) ─────────────────────────────────────────
const IconEmail = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconPhone = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 5.52 5.52l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
  </svg>
);
const IconChat = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconGlobe = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconSend = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    className="w-4 h-4"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    className="w-7 h-7 text-accent"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconAlert = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-4 h-4 mt-0.5 shrink-0"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconSpinner = () => (
  <svg
    className="w-4 h-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity={0.3} />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

// ── Info card data ─────────────────────────────────────────────────────────
const INFO_ITEMS = [
  {
    icon: <IconEmail />,
    label: "EMAIL",
    value: "johirulislam574206@gmail.com",
    href: "mailto:johirulislam574206@gmail.com",
  },
  {
    icon: <IconPhone />,
    label: "PHONE",
    value: "+880 1824842336",
    href: "tel:+8801824842336",
  },
  {
    icon: <IconChat />,
    label: "WHATSAPP",
    value: "Chat instantly",
    href: "https://wa.me/8801824842336",
  },
  
];

// ── Field config (drives the form declaratively) ───────────────────────────
type FieldCfg = {
  name: keyof FormData;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  rows?: number; // textarea if present
};

const FIELDS: FieldCfg[][] = [
  [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", required: true, type: "email" },
  ],
  [
    { name: "phone", label: "Phone" },
    { name: "service", label: "Service Needed" },
  ],
  [
    {
      name: "budget",
      label: "Budget (USD)",
      type: "number",
      placeholder: "$999",
    },
  ],
  [
    {
      name: "message",
      label: "Message",
      placeholder: "Tell me about your goals…",
      rows: 4,
    },
  ],
];

// ═════════════════════════════════════════════════════════════════════════════
export default function Contact() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  // intersection observer → fade-in
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Theme tokens ───────────────────────────────────────────────────────
  const t = {
    sectionBg: dark ? "" : "bg-[#f0f6ff]",
    eyebrowBg: dark ? "bg-accent/10" : "bg-white/80",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    subtext: "text-ink-soft",
    infoBg: "bg-card",
    infoBdr: "border-line",
    infoLabel: "text-ink-muted",
    infoValue: "text-ink",
    iconWrap: "bg-accent-solid",
    iconColor: dark ? "text-accent" : "text-white",
    formBg: "bg-card",
    formBdr: "border-line",
    inputBg: "bg-surface",
    inputBdr: "border-line focus:border-accent",
    inputTxt: "text-ink",
    inputPh: "placeholder-ink-muted",
    labelTxt: "text-ink-soft",
    errorBg: dark
      ? "bg-red-500/10 border-red-500/30"
      : "bg-red-50 border-red-200",
    errorTxt: dark ? "text-red-400" : "text-red-600",
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (state.status === "error") setState({ status: "idle" });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    setState({ status: "loading" });

    try {
      const body: Record<string, string | number> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };
      if (formData.phone.trim()) body.phone = formData.phone.trim();
      if (formData.service.trim()) body.service = formData.service.trim();
      if (formData.budget) body.budget = Number(formData.budget);
      if (formData.message.trim()) body.message = formData.message.trim();

      const { ok, status, json } = await submitContact(body);

      if (!ok) {
        setState({
          status: "error",
          message: json.message ?? "Something went wrong. Please try again.",
          ...(status === 429 && {
            retryAfterMinutes: json.data?.retryAfterMinutes,
          }),
        });
        return;
      }

      setState({ status: "success" });
      setFormData(INITIAL_FORM); // clear fields on success
    } catch {
      setState({
        status: "error",
        message: "Network error. Please check your connection.",
      });
    }
  };

  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  // ── Shared input/textarea classes ──────────────────────────────────────
  const inputCls = `w-full rounded-xl px-4 py-3 text-[14px] ${t.inputBg} border ${t.inputBdr} ${t.inputTxt} ${t.inputPh} outline-none transition-colors duration-150 disabled:opacity-50`;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="contact"
      className={`w-full max-width mx-auto px-6 md:px-10 pb-24 md:pb-32 ${t.sectionBg}`}
    >
      {/* ── Eyebrow + Headline ── */}
      <div
        className={`flex flex-col items-center text-center mb-14 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${t.eyebrowBdr} ${t.eyebrowBg} ${t.eyebrowTxt} text-[11px] font-bold tracking-[0.14em] uppercase mb-6`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${t.eyebrowDot} shrink-0`}
          />
          Contact
        </div>
        <h2
          className={`text-4xl md:text-5xl font-extrabold ${t.heading} leading-tight mb-4 tracking-tight`}
        >
          Let&apos;s Build Something
          <span className="text-accent"> Great Together</span>
        </h2>

        <p className={`text-base ${t.subtext} max-w-md`}>
          Have a project in mind? Let&apos;s discuss your ideas and create
          something impactful together.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6">
        {/* Left: Info cards */}
        <div className="flex flex-col gap-4">
          {INFO_ITEMS.map((item, i) => {
            const card = (
              <div
                className={`flex items-center gap-4 ${t.infoBg} border ${t.infoBdr} rounded-2xl p-5 transition-all duration-200 ${
                  item.href ? "hover:border-accent/40 cursor-pointer" : ""
                }`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms, border-color 0.2s`,
                }}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${t.iconWrap} flex items-center justify-center shrink-0 ${t.iconColor}`}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    className={`text-[10px] font-bold tracking-[0.13em] uppercase ${t.infoLabel} mb-0.5`}
                  >
                    {item.label}
                  </p>
                  <p className={`text-[14px] font-semibold ${t.infoValue}`}>
                    {item.value}
                  </p>
                </div>
              </div>
            );

            return item.href ? (
              <Link
                key={i}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {card}
              </Link>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>

        {/* Right: Form card */}
        <div
          className={`${t.formBg} border ${t.formBdr} rounded-2xl p-7`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 200ms, transform 0.6s ease 200ms",
          }}
        >
          {isSuccess ? (
            /* ── Success ── */
            <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                <IconCheck />
              </div>
              <p className={`text-lg font-bold ${t.heading}`}>Message sent!</p>
              <p className={`text-sm ${t.subtext} text-center max-w-xs`}>
                Thanks for reaching out. I&apos;ll get back to you within a few
                hours.
              </p>
              <button
                onClick={() => setState({ status: "idle" })}
                className="mt-2 text-[13px] text-accent hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="flex flex-col gap-5">
              {/* Error / rate-limit banner */}
              {isError && (
                <div
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${t.errorBg}`}
                >
                  <span className={t.errorTxt}>
                    <IconAlert />
                  </span>
                  <div>
                    <p className={`text-[13px] font-medium ${t.errorTxt}`}>
                      {state.message}
                    </p>
                    {state.retryAfterMinutes && (
                      <p
                        className={`text-[12px] mt-0.5 ${t.errorTxt} opacity-75`}
                      >
                        You can try again in {state.retryAfterMinutes} minute
                        {state.retryAfterMinutes !== 1 ? "s" : ""}.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Fields — driven by FIELDS config */}
              {FIELDS.map((row, ri) => (
                <div
                  key={ri}
                  className={
                    row.length > 1
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
                      : ""
                  }
                >
                  {row.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1.5">
                      <label
                        className={`text-[10px] font-bold tracking-[0.13em] uppercase ${t.labelTxt}`}
                      >
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-accent">*</span>
                        )}
                      </label>

                      {field.rows ? (
                        <textarea
                          name={field.name}
                          rows={field.rows}
                          value={formData[field.name]}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder={field.placeholder}
                          className={`${inputCls} resize-none`}
                        />
                      ) : (
                        <input
                          name={field.name}
                          type={field.type ?? "text"}
                          value={formData[field.name]}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder={field.placeholder}
                          className={inputCls}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading || !formData.name.trim() || !formData.email.trim()
                }
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-accent-solid hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed text-ink-contrast font-bold text-[14px] tracking-wide transition-colors duration-200 w-fit"
              >
                {isLoading ? (
                  <>
                    <IconSpinner /> Sending…
                  </>
                ) : (
                  <>
                    Send Message <IconSend />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
