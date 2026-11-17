/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { COUNTRIES } from "@/app/Layout/Client/HeadingComponents/Country";
import { useStartProject } from "@/hooks/useStartProject";
import React, { useEffect, useRef, useState } from "react";

// ─── Static English Content ──────────────────────────────────────────────────
const CONTENT = {
  step1: {
    title: "Hi Sir,\nWhich service are you looking for?",
    next: "Next →",
    othersLabel: "Others",
    othersPlaceholder: "Describe your project category…",
    categories: [
      "Personal Portfolio",
      "Business Profile",
      "Corporate Website",
      "Educational Website",
      "Real Estate Website",
      "E-Commerce",
      "Agency Website",
      "Web Application",
      "Custom Software",
      "Mobile Application",
      "ERP & CRM Solutions",
      "News & Magazine Portal",
      "Healthcare Website",
      "School Management System",
      "Hospital Management System",
      "AI & Automation",
      "Others",
    ],
  },
  step2: {
    title: "What's your estimated budget?",
    next: "Next →",
    back: "← Back",
    currencySymbol: "$",
    customLabel: "Custom Budget",
    customPlaceholder: "Enter amount (min $50)",
    customMinError: "Minimum is $50",
    customMin: 50,
    budgets: [
      { label: "$100 – $200", value: "100-200" },
      { label: "$200 – $300", value: "200-300" },
      { label: "$300 – $500", value: "300-500" },
      { label: "$500 – $800", value: "500-800" },
      { label: "$800 – $1,200", value: "800-1200" },
      { label: "$1,200 – $2,000", value: "1200-2000" },
      { label: "$2,000 – $3,000", value: "2000-3000" },
      { label: "$3,000 – $5,000", value: "3000-5000" },
      { label: "$5,000 – $10,000", value: "5000-10000" },
      { label: "$10,000 – $20,000", value: "10000-20000" },
      { label: "$20,000+", value: "20000+" },
      { label: "Custom Budget", value: "custom" },
    ],
  },
  step3: {
    title: "Let's get started,\nTell Us About Your Project",
    breadcrumbLabel: "Project Brief",
    back: "← Back",
    submit: "Submit",
    submitting: "Sending…",
    fieldName: "Name",
    fieldPhone: "Phone (optional)",
    fieldEmail: "Email",
    fieldCompany: "Company / Business Name",
    fieldWhatsapp: "WhatsApp Number (optional)",
    fieldDetails:
      "Briefly describe your project, goals, target users, and must-have features…",
    fieldCountry: "Country",
  },
  success: {
    title: "Project Submitted!",
    message:
      "We've received your details and will get in touch within 24 hours. Keep an eye on your inbox.",
    reset: "Start a New Project",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  category: string;
  customCategory: string;
  budget: string;
  customBudget: string;
  name: string;
  contact: string;
  whatsapp: string;
  email: string;
  companyOrDomain: string;
  country: string;
  startDate: string;
  endDate: string;
  details: string;
}

const EMPTY_FORM: FormData = {
  category: "",
  customCategory: "",
  budget: "",
  customBudget: "",
  name: "",
  contact: "",
  whatsapp: "",
  email: "",
  companyOrDomain: "",
  country: "",
  startDate: "",
  endDate: "",
  details: "",
};

// ─── Pill Button ──────────────────────────────────────────────────────────────
function PillOption({
  label,
  selected,
  onClick,
  delay = 0,
  price = "",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
  price?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`
        group relative flex items-center gap-2.5 px-5 py-3 rounded-full border text-[14px] md:text-[16px] font-medium
        transition-all duration-300 cursor-pointer animate-fadeIn
        ${
          selected
            ? "border-white/50 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
            : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:bg-white/8 hover:text-white/90"
        }
      `}
    >
      <span
        className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
          transition-all duration-200
          ${selected ? "border-white bg-white" : "border-white/30 group-hover:border-white/50"}
        `}
      >
        {selected && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d0d2b] block" />
        )}
      </span>
      {/* {price && <span className="font-bold pt-1 font-serif">{price}</span>} */}
      {label}
    </button>
  );
}

// ─── Breadcrumb Pills ─────────────────────────────────────────────────────────
function BreadcrumbPills({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
      {items.map((item, i) => (
        <span
          key={i}
          className="px-5 py-2 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Country Dropdown ─────────────────────────────────────────────────────────
function CountrySelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/10 bg-white/5
          text-sm text-left focus:outline-none focus:border-white/30 transition-all duration-200 hover:border-white/20"
      >
        <span className={value ? "text-white" : "text-white/30"}>
          {value || placeholder}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5l5 5 5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-white/10 bg-[#13132e] shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                placeholder-white/30 focus:outline-none focus:border-white/25 transition-all"
            />
          </div>
          <div className="max-h-48 overflow-y-auto sp-scroll">
            {filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                  ${value === c ? "text-white bg-white/10" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              >
                {c}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-white/30 text-sm">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({
  placeholder,
  value,
  onChange,
  type = "text",
  maxLength,
  required,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder + (required ? " *" : "")}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white
        placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/8
        transition-all duration-200 hover:border-white/15"
    />
  );
}

// ─── STEP 1: Category ─────────────────────────────────────────────────────────
function StepCategory({
  form,
  setForm,
  onNext,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onNext: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const { categories, othersLabel, othersPlaceholder, title, next } =
    CONTENT.step1;

  const canNext =
    form.category !== "" &&
    (form.category !== othersLabel || form.customCategory.trim() !== "");

  return (
    <div
      className={`transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="text-center mb-14">
        <h1
          className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-white leading-tight tracking-tight whitespace-pre-line"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:flex flex-wrap justify-center gap-3 md:gap-5 mb-10">
        {categories.map((cat, i) => (
          <PillOption
            key={cat}
            label={cat}
            selected={form.category === cat}
            delay={i * 35}
            onClick={() =>
              setForm({
                ...form,
                category: cat,
                customCategory: cat !== othersLabel ? "" : form.customCategory,
              })
            }
          />
        ))}
      </div>

      {form.category === othersLabel && (
        <div
          className="max-w-lg mx-auto mb-8"
          style={{ animation: "slideDown 0.3s ease" }}
        >
          <input
            autoFocus
            type="text"
            maxLength={120}
            value={form.customCategory}
            onChange={(e) =>
              setForm({ ...form, customCategory: e.target.value })
            }
            placeholder={othersPlaceholder}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white
              placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-200 text-center"
          />
          <p className="text-right text-[11px] text-white/25 mt-1">
            {form.customCategory.length}/120
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={`px-10 py-3.5 rounded-full text-[14px] md:text-[16px] font-semibold tracking-wide transition-all duration-300
            ${
              canNext
                ? "btn--primary text-[#0d0d2b] hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
        >
          {next}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: Budget ───────────────────────────────────────────────────────────
function StepBudget({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const {
    budgets,
    currencySymbol,
    customMin,
    title,
    back,
    next,
    customPlaceholder,
    customMinError,
  } = CONTENT.step2;

  const canNext =
    form.budget !== "" &&
    (form.budget !== "custom" || Number(form.customBudget) >= customMin);

  const othersLabel = CONTENT.step1.othersLabel;
  const breadcrumb =
    form.category === othersLabel ? form.customCategory : form.category;

  return (
    <div
      className={`transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <BreadcrumbPills items={[breadcrumb].filter(Boolean)} />

      <div className="text-center mb-14">
        <h1
          className="text-3xl max-line-hight md:text-4xl lg:text-[2.6rem] font-bold text-white "
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:flex  flex-wrap justify-center gap-3 md:gap-5 mb-10">
        {budgets.map((b, i) => (
          <PillOption
            key={b.value}
            label={b.label}
            selected={form.budget === b.value}
            delay={i * 30}
            price={b.value !== "custom" ? currencySymbol : ""}
            onClick={() =>
              setForm({
                ...form,
                budget: b.value,
                customBudget: b.value !== "custom" ? "" : form.customBudget,
              })
            }
          />
        ))}
      </div>

      {form.budget === "custom" && (
        <div
          className="max-w-sm mx-auto mb-8"
          style={{ animation: "slideDown 0.3s ease" }}
        >
          <input
            autoFocus
            type="number"
            min={customMin}
            value={form.customBudget}
            onChange={(e) => setForm({ ...form, customBudget: e.target.value })}
            placeholder={customPlaceholder}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white
              placeholder-white/30 focus:outline-none focus:border-white/40 transition-all duration-200 text-center"
          />
          {form.customBudget && Number(form.customBudget) < customMin && (
            <p className="text-red-400/80 text-xs text-center mt-1.5">
              {customMinError}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3.5 rounded-full text-[14px] md:text-[16px] font-semibold border border-white/15 text-white/50
            hover:border-white/30 hover:text-white/80 transition-all duration-200"
        >
          {back}
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={`px-10 py-3.5 rounded-full text-[14px] md:text-[16px] font-semibold tracking-wide transition-all duration-300
            ${
              canNext
                ? "btn--primary text-[#0d0d2b] hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
        >
          {next}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: Info ─────────────────────────────────────────────────────────────
function StepInfo({
  form,
  setForm,
  onBack,
  onSubmit,
  submitting,
  error,
  retryAfterMinutes,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error?: string | null;
  retryAfterMinutes?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const up = (key: keyof FormData) => (v: string) =>
    setForm({ ...form, [key]: v });

  const canSubmit =
    form.name.trim() && form.email.trim() && form.country && form.startDate;

  const { budgets, currencySymbol } = CONTENT.step2;
  const othersLabel = CONTENT.step1.othersLabel;
  const {
    title,
    breadcrumbLabel,
    back,
    submit,
    submitting: submittingLabel,
    fieldName,
    fieldPhone,
    fieldEmail,
    fieldCompany,
    fieldWhatsapp,
    fieldDetails,
    fieldCountry,
  } = CONTENT.step3;

  const catLabel =
    form.category === othersLabel ? form.customCategory : form.category;
  const budLabel =
    budgets.find((b) => b.value === form.budget)?.label ??
    (form.customBudget ? `${currencySymbol}${form.customBudget}` : "");

  return (
    <div
      className={`transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <BreadcrumbPills
        items={[catLabel, budLabel, breadcrumbLabel].filter(Boolean)}
      />

      <div className="text-center mb-10">
        <h1
          className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-white leading-tight tracking-tight whitespace-pre-line"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {title}
        </h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input
            placeholder={fieldName}
            value={form.name}
            onChange={up("name")}
            required
          />
          <Input
            placeholder={fieldPhone}
            value={form.contact}
            onChange={up("contact")}
          />
          <Input
            placeholder={fieldEmail}
            type="email"
            value={form.email}
            onChange={up("email")}
            required
          />
          <Input
            placeholder={fieldCompany}
            value={form.companyOrDomain}
            onChange={up("companyOrDomain")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <CountrySelect
            value={form.country}
            onChange={up("country")}
            placeholder={fieldCountry}
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white/80
              focus:outline-none focus:border-white/30 transition-all duration-200 [color-scheme:dark] hover:border-white/15"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white/80
              focus:outline-none focus:border-white/30 transition-all duration-200 [color-scheme:dark] hover:border-white/15"
          />
        </div>

        <div className="mb-3">
          <Input
            placeholder={fieldWhatsapp}
            value={form.whatsapp}
            onChange={up("whatsapp")}
          />
        </div>

        <div className="mb-6">
          <textarea
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            maxLength={10000}
            rows={5}
            placeholder={fieldDetails}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white
              placeholder-white/30 focus:outline-none focus:border-white/30 transition-all duration-200
              hover:border-white/15 resize-none"
          />
          <p className="text-right text-[11px] text-white/20 -mt-0.5">
            {form.details.length}/10,000
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-red-400/30 bg-red-500/10 text-red-300 text-sm text-center">
            {error}
            {typeof retryAfterMinutes === "number" && (
              <span className="block text-red-300/70 text-xs mt-1">
                Please try again in {retryAfterMinutes} minute(s).
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3.5 rounded-full text-sm font-semibold border border-white/15 text-white/50
              hover:border-white/30 hover:text-white/80 transition-all duration-200"
          >
            {back}
          </button>
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={onSubmit}
            className={`px-10 py-3.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300
              flex items-center gap-2.5
              ${
                canSubmit && !submitting
                  ? "bg-[#e8275a] hover:bg-[#d01f4f] text-white shadow-[0_0_30px_rgba(232,39,90,0.35)] hover:shadow-[0_0_40px_rgba(232,39,90,0.45)] hover:scale-105"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
          >
            {submitting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="31.4"
                    strokeDashoffset="10"
                  />
                </svg>
                {submittingLabel}
              </>
            ) : (
              submit
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function SuccessScreen({ onReset }: { onReset: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const { title, message, reset } = CONTENT.success;

  return (
    <div
      className={`flex flex-col items-center text-center py-16 transition-all duration-700 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <div className="w-20 h-20 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.08)]">
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          <path
            d="M8 21l9 9 15-16"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2
        className="text-3xl font-bold text-white mb-3"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        {title}
      </h2>
      <p className="text-white/40 text-sm max-w-sm mb-10 leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="px-8 py-3 rounded-full border border-white/15 text-white/60 text-sm font-semibold
          hover:border-white/30 hover:text-white/90 transition-all duration-200"
      >
        {reset}
      </button>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function StartProject() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const next = () => {
    setStep((s) => s + 1);
    scrollTop();
  };
  const back = () => {
    setStep((s) => s - 1);
    scrollTop();
  };

  const {
    submitStartProject,
    loading,
    success,
    error,
    retryAfterMinutes,
    reset,
  } = useStartProject();

  // Go to success screen when API call succeeds
  useEffect(() => {
    if (success) {
      setSubmitted(true);
    }
  }, [success]);

  const submit = async () => {
    const { budgets, currencySymbol } = CONTENT.step2;
    const othersLabel = CONTENT.step1.othersLabel;

    await submitStartProject({
      name: form.name,
      email: form.email,
      contact: form.contact,
      whatsapp: form.whatsapp,
      companyOrDomain: form.companyOrDomain,
      country: form.country,
      category:
        form.category === othersLabel ? form.customCategory : form.category,
      budget:
        form.budget === "custom"
          ? `Custom: ${currencySymbol}${form.customBudget}`
          : (budgets.find((b) => b.value === form.budget)?.label ??
            form.budget),
      startDate: form.startDate,
      endDate: form.endDate,
      details: form.details,
    });
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setStep(0);
    setSubmitted(false);
    reset();
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease both; }
        .sp-scroll::-webkit-scrollbar { width: 4px; }
        .sp-scroll::-webkit-scrollbar-track { background: transparent; }
        .sp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
      `}</style>

      <section
        id="start-project"
        ref={topRef}
        className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 py-24"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, #1e1060 0%, #0d0d2b 55%, #060616 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 80% 10%, rgba(80,40,160,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 30% at 15% 80%, rgba(40,20,100,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-4xl">
          {submitted ? (
            <SuccessScreen onReset={handleReset} />
          ) : (
            <>
              {step === 0 && (
                <StepCategory form={form} setForm={setForm} onNext={next} />
              )}
              {step === 1 && (
                <StepBudget
                  form={form}
                  setForm={setForm}
                  onNext={next}
                  onBack={back}
                />
              )}
              {step === 2 && (
                <StepInfo
                  form={form}
                  setForm={setForm}
                  onBack={back}
                  onSubmit={submit}
                  submitting={loading}
                  error={error}
                  retryAfterMinutes={retryAfterMinutes}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
