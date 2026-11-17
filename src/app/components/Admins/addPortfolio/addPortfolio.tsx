/* eslint-disable react-hooks/set-state-in-effect */

"use client";
import config from "@/app/config/Config";
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import { AuthContext } from "@/app/admins/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────
export type ProjectCategory =
  | "Web Apps"
  | "Mobile Apps"
  | "E-Commerce"
  | "SaaS"
  | "UI/UX Design"
  | "Digital Marketing"
  | "Video Editing";

const CATEGORIES: ProjectCategory[] = [
  "Web Apps",
  "Mobile Apps",
  "E-Commerce",
  "SaaS",
  "UI/UX Design",
  "Digital Marketing",
  "Video Editing",
];

const FILTER_CATEGORIES: (ProjectCategory | "All")[] = ["All", ...CATEGORIES];

export interface TechStackItem {
  name: string;
  /** simple-icons slug — omitted for custom/unrecognized technologies */
  slug?: string;
}

export interface Project {
  _id?: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  problem_statement?: string;
  description?: string;
  client_name?: string;
  cover_image: string; // main image — required
  image_2?: string; // secondary image — optional
  image_3?: string; // tertiary image — optional
  tech_stack?: TechStackItem[];
  live_url?: string;
  github_url?: string;
  tags?: string[];
  featured?: boolean;
}

type Tab = "display" | "create";

// Adjust to match your Next.js API route, e.g. /api/project
const API_BASE = `/${config.API_URL}/portfolio`;
const IMGBB_API_KEY = "3f45e45f29d38cd0eb2de6b64f0d42ed";

// ── Tech stack catalogue (icons served from simple-icons CDN, free & keyless) ─
const TECH_OPTIONS: TechStackItem[] = [
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Vue.js", slug: "vuedotjs" },
  { name: "Angular", slug: "angular" },
  { name: "Svelte", slug: "svelte" },
  { name: "TypeScript", slug: "typescript" },
  { name: "JavaScript", slug: "javascript" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Express", slug: "express" },
  { name: "NestJS", slug: "nestjs" },
  { name: "Python", slug: "python" },
  { name: "Django", slug: "django" },
  { name: "Flask", slug: "flask" },
  { name: "FastAPI", slug: "fastapi" },
  { name: "PHP", slug: "php" },
  { name: "Laravel", slug: "laravel" },
  { name: "Ruby on Rails", slug: "rubyonrails" },
  { name: "Java", slug: "openjdk" },
  { name: "Spring Boot", slug: "spring" },
  { name: "Kotlin", slug: "kotlin" },
  { name: "Swift", slug: "swift" },
  { name: "Flutter", slug: "flutter" },
  { name: "Dart", slug: "dart" },
  { name: "React Native", slug: "react" },
  { name: "Go", slug: "go" },
  { name: "Rust", slug: "rust" },
  { name: "C++", slug: "cplusplus" },
  { name: "C#", slug: "csharp" },
  { name: ".NET", slug: "dotnet" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MySQL", slug: "mysql" },
  { name: "MariaDB", slug: "mariadb" },
  { name: "SQLite", slug: "sqlite" },
  { name: "Redis", slug: "redis" },
  { name: "Firebase", slug: "firebase" },
  { name: "Supabase", slug: "supabase" },
  { name: "GraphQL", slug: "graphql" },
  { name: "Docker", slug: "docker" },
  { name: "Kubernetes", slug: "kubernetes" },
  { name: "AWS", slug: "amazonaws" },
  { name: "Google Cloud", slug: "googlecloud" },
  { name: "Azure", slug: "microsoftazure" },
  { name: "Vercel", slug: "vercel" },
  { name: "Netlify", slug: "netlify" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "Bootstrap", slug: "bootstrap" },
  { name: "Sass", slug: "sass" },
  { name: "Figma", slug: "figma" },
  { name: "Sketch", slug: "sketch" },
  { name: "WordPress", slug: "wordpress" },
  { name: "Shopify", slug: "shopify" },
  { name: "WooCommerce", slug: "woocommerce" },
  { name: "Stripe", slug: "stripe" },
  { name: "PayPal", slug: "paypal" },
  { name: "Socket.io", slug: "socketdotio" },
  { name: "Redux", slug: "redux" },
  { name: "Webpack", slug: "webpack" },
  { name: "Vite", slug: "vite" },
  { name: "Git", slug: "git" },
  { name: "GitHub", slug: "github" },
  { name: "GitLab", slug: "gitlab" },
  { name: "Jenkins", slug: "jenkins" },
  { name: "Elasticsearch", slug: "elasticsearch" },
  { name: "Nginx", slug: "nginx" },
  { name: "HTML5", slug: "html5" },
  { name: "CSS3", slug: "css3" },
  { name: "Adobe Photoshop", slug: "adobephotoshop" },
  { name: "Adobe Illustrator", slug: "adobeillustrator" },
  { name: "Adobe Premiere Pro", slug: "adobepremierepro" },
  { name: "Adobe After Effects", slug: "adobeaftereffects" },
  { name: "DaVinci Resolve", slug: "davinciresolve" },
  { name: "Canva", slug: "canva" },
  { name: "Google Ads", slug: "googleads" },
  { name: "Google Analytics", slug: "googleanalytics" },
  { name: "Meta", slug: "meta" },
  { name: "Mailchimp", slug: "mailchimp" },
  { name: "HubSpot", slug: "hubspot" },
];

const techIconUrl = (slug?: string) =>
  slug ? `https://cdn.simpleicons.org/${slug}` : "";

// ── Auth helper ────────────────────────────────────────────────────────────
const getAuthHeaders = (token?: string | null): HeadersInit =>
  token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

// ── ImgBB upload (reused for all 3 image slots) ────────────────────────────
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

// ── API layer ──────────────────────────────────────────────────────────────
const api = {
  getAll: async (): Promise<Project[]> => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? json.result ?? []);
  },

  create: async (project: Project, token?: string | null): Promise<Project> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(project),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.message ?? `Failed to create project (${res.status})`,
      );
    }
    const json = await res.json();
    return json.data ?? json;
  },

  update: async (
    id: string,
    project: Project,
    token?: string | null,
  ): Promise<Project> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(project),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.message ?? `Failed to update project (${res.status})`,
      );
    }
    const json = await res.json();
    return json.data ?? json;
  },

  delete: async (id: string, token?: string | null): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    if (res.status === 401 || res.status === 403)
      throw new Error("Unauthorized — please log in as admin.");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.message ?? `Failed to delete project (${res.status})`,
      );
    }
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const emptyProject = (): Project => ({
  title: "",
  category: "Web Apps",
  summary: "",
  problem_statement: "",
  description: "",
  client_name: "",
  cover_image: "",
  image_2: "",
  image_3: "",
  tech_stack: [],
  live_url: "",
  github_url: "",
  tags: [],
  featured: false,
});

const inputCls =
  "w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-cyan-500";

const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500";

// ── Category badge / accent styles (static classes for Tailwind JIT) ──────
const CATEGORY_STYLES: Record<
  ProjectCategory,
  { badge: string; solid: string }
> = {
  "Web Apps": {
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    solid: "bg-cyan-500",
  },
  "Mobile Apps": {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    solid: "bg-violet-500",
  },
  "E-Commerce": {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    solid: "bg-amber-500",
  },
  SaaS: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    solid: "bg-emerald-500",
  },
  "UI/UX Design": {
    badge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    solid: "bg-pink-500",
  },
  "Digital Marketing": {
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    solid: "bg-orange-500",
  },
  "Video Editing": {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    solid: "bg-rose-500",
  },
};

// ── Toast ──────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => (
  <div
    className={`fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/40 ${
      type === "success" ? "bg-emerald-600" : "bg-rose-600"
    }`}
  >
    <span>{type === "success" ? "✓" : "✕"}</span>
    {message}
    <button
      onClick={onClose}
      className="ml-1 text-lg leading-none text-white/80 hover:text-white"
    >
      ×
    </button>
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
  <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-7 text-center shadow-2xl">
      <div className="mb-3 text-3xl">🗑️</div>
      <p className="mb-6 text-sm text-slate-200">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Image drop slot (reused for main / 2nd / 3rd image) ────────────────────
interface ImageDropSlotProps {
  label: string;
  required?: boolean;
  preview: string;
  urlValue: string;
  onPick: (file: File) => void;
  onUrlChange: (url: string) => void;
  tall?: boolean;
}
const ImageDropSlot: React.FC<ImageDropSlotProps> = ({
  label,
  required,
  preview,
  urlValue,
  onPick,
  onUrlChange,
  tall,
}) => {
  const inputId = `img-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label className={labelCls}>
        {label} {required && <span className="text-cyan-400">*</span>}
      </label>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        {preview ? (
          <img
            src={preview}
            alt={label}
            className={`mb-3 w-full rounded-lg border border-slate-800 object-cover ${
              tall ? "h-40" : "h-28"
            }`}
          />
        ) : (
          <div
            className={`mb-3 flex w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/60 text-2xl text-slate-700 ${
              tall ? "h-40" : "h-28"
            }`}
          >
            🖼️
          </div>
        )}

        <label
          htmlFor={inputId}
          className="inline-block cursor-pointer rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          {preview ? "Change" : "Upload"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
          }}
        />
        <input
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="or paste image URL"
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[11px] text-slate-300 outline-none focus:border-cyan-500"
        />
      </div>
    </div>
  );
};

// ── Tech stack searchable multi-select ─────────────────────────────────────
interface TechPickerProps {
  selected: TechStackItem[];
  onChange: (items: TechStackItem[]) => void;
}
const TechStackPicker: React.FC<TechPickerProps> = ({ selected, onChange }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = TECH_OPTIONS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) &&
      !selected.some((s) => s.name.toLowerCase() === t.name.toLowerCase()),
  ).slice(0, 8);

  const exactExists =
    TECH_OPTIONS.some(
      (t) => t.name.toLowerCase() === query.trim().toLowerCase(),
    ) ||
    selected.some((s) => s.name.toLowerCase() === query.trim().toLowerCase());

  const addTech = (item: TechStackItem) => {
    onChange([...selected, item]);
    setQuery("");
  };
  const removeTech = (name: string) =>
    onChange(selected.filter((t) => t.name !== name));

  return (
    <div ref={wrapRef} className="relative">
      {selected.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {selected.map((t) => (
            <span
              key={t.name}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 py-1 pl-1.5 pr-2 text-xs font-medium text-slate-200"
            >
              {t.slug ? (
                <img
                  src={techIconUrl(t.slug)}
                  alt=""
                  className="h-3.5 w-3.5"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              ) : (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500/30 text-[8px] font-bold text-cyan-300">
                  {t.name[0]}
                </span>
              )}
              {t.name}
              <button
                type="button"
                onClick={() => removeTech(t.name)}
                className="ml-0.5 text-slate-500 hover:text-rose-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search & add a technology — React, Node.js, MongoDB…"
        className={inputCls}
      />

      {open && (filtered.length > 0 || (query.trim() && !exactExists)) && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
          {filtered.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => addTech(t)}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800"
            >
              <img
                src={techIconUrl(t.slug)}
                alt=""
                className="h-4 w-4"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {t.name}
            </button>
          ))}
          {query.trim() && !exactExists && (
            <button
              type="button"
              onClick={() => addTech({ name: query.trim() })}
              className="flex w-full items-center gap-2 border-t border-slate-800 px-3.5 py-2.5 text-left text-sm font-semibold text-cyan-400 hover:bg-slate-800"
            >
              + Add {query.trim()} as custom tech
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── ProjectForm ──────────────────────────────────────────────────────────
interface FormProps {
  initial?: Project;
  onSave: (p: Project) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}
const ProjectForm: React.FC<FormProps> = ({
  initial,
  onSave,
  onCancel,
  loading,
}) => {
  const [form, setForm] = useState<Project>(initial ?? emptyProject());
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState(initial?.cover_image ?? "");
  const [preview2, setPreview2] = useState(initial?.image_2 ?? "");
  const [preview3, setPreview3] = useState(initial?.image_3 ?? "");
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const p = initial ?? emptyProject();
    setForm(p);
    setMainPreview(p.cover_image ?? "");
    setPreview2(p.image_2 ?? "");
    setPreview3(p.image_3 ?? "");
    setMainFile(null);
    setFile2(null);
    setFile3(null);
    setTagInput("");
  }, [initial]);

  const set = <K extends keyof Project>(k: K, v: Project[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

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

  const submit = async () => {
    if (!form.title.trim()) return alert("Project title is required.");
    if (!form.summary.trim()) return alert("Summary is required.");
    if (!form.cover_image && !mainFile)
      return alert("Main cover image is required.");

    let cover = form.cover_image;
    let img2 = form.image_2 ?? "";
    let img3 = form.image_3 ?? "";

    if (mainFile || file2 || file3) {
      setUploading(true);
      try {
        if (mainFile) cover = await uploadToImgBB(mainFile);
        if (file2) img2 = await uploadToImgBB(file2);
        if (file3) img3 = await uploadToImgBB(file3);
      } catch {
        alert(
          "Image upload failed. Please check your ImgBB API key / connection.",
        );
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    await onSave({ ...form, cover_image: cover, image_2: img2, image_3: img3 });
  };

  const isBusy = loading || uploading;

  return (
    <div className="flex flex-col gap-6">
      {/* Core details */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2.5">
        <p className="text-[11px] font-bold tracking-widest text-cyan-400">
          ★ CORE DETAILS
        </p>
      </div>

      <div>
        <label className={labelCls}>Project Title *</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. FinTrack — Personal Finance Dashboard"
          className={inputCls}
        />
      </div>

      <div>
        <label className={`${labelCls} mb-2`}>Category *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = form.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => set("category", cat)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? `${CATEGORY_STYLES[cat].solid} border-transparent text-white`
                    : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>Summary *</label>
        <input
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="One-line result — e.g. 40% faster checkout, 12K+ active users"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Problem Statement</label>
        <textarea
          value={form.problem_statement ?? ""}
          onChange={(e) => set("problem_statement", e.target.value)}
          placeholder="What problem was the client facing before this project?"
          className={`${inputCls} min-h-[80px] resize-y`}
        />
      </div>

      <div>
        <label className={labelCls}>Solution / Description</label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="How did you solve it? Approach, architecture, key features…"
          className={`${inputCls} min-h-[100px] resize-y`}
        />
      </div>

      <div>
        <label className={labelCls}>Client Name</label>
        <input
          value={form.client_name ?? ""}
          onChange={(e) => set("client_name", e.target.value)}
          placeholder="e.g. Northwind Retail Ltd."
          className={inputCls}
        />
      </div>

      {/* Images */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2.5">
        <p className="text-[11px] font-bold tracking-widest text-violet-400">
          PROJECT IMAGES
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ImageDropSlot
          label="Main Image"
          required
          tall
          preview={mainPreview}
          urlValue={form.cover_image}
          onPick={(f) => {
            setMainFile(f);
            setMainPreview(URL.createObjectURL(f));
          }}
          onUrlChange={(v) => {
            set("cover_image", v);
            setMainPreview(v);
            setMainFile(null);
          }}
        />
        <ImageDropSlot
          label="Image 2"
          preview={preview2}
          urlValue={form.image_2 ?? ""}
          onPick={(f) => {
            setFile2(f);
            setPreview2(URL.createObjectURL(f));
          }}
          onUrlChange={(v) => {
            set("image_2", v);
            setPreview2(v);
            setFile2(null);
          }}
        />
        <ImageDropSlot
          label="Image 3"
          preview={preview3}
          urlValue={form.image_3 ?? ""}
          onPick={(f) => {
            setFile3(f);
            setPreview3(URL.createObjectURL(f));
          }}
          onUrlChange={(v) => {
            set("image_3", v);
            setPreview3(v);
            setFile3(null);
          }}
        />
      </div>

      {/* Tech stack */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
        <p className="text-[11px] font-bold tracking-widest text-emerald-400">
          TECH STACK
        </p>
      </div>
      <TechStackPicker
        selected={form.tech_stack ?? []}
        onChange={(items) => set("tech_stack", items)}
      />

      {/* Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Live Project URL</label>
          <input
            value={form.live_url ?? ""}
            onChange={(e) => set("live_url", e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>GitHub / Repo URL</label>
          <input
            value={form.github_url ?? ""}
            onChange={(e) => set("github_url", e.target.value)}
            placeholder="https://github.com/…"
            className={inputCls}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={`${labelCls} mb-2`}>Tags</label>
        {(form.tags ?? []).length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {(form.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300"
              >
                {tag}
                <span
                  onClick={() => removeTag(tag)}
                  className="cursor-pointer text-slate-500 hover:text-rose-400"
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            placeholder="Type a tag and press Enter"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addTag}
            className="shrink-0 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            Add
          </button>
        </div>
      </div>

      {/* Featured toggle */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
        <input
          type="checkbox"
          checked={!!form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 accent-cyan-500"
        />
        <span className="text-sm text-slate-300">
          Mark as <span className="font-semibold text-amber-400">Featured</span>{" "}
          project (highlighted on homepage)
        </span>
      </label>

      {/* Actions */}
      <div className="mt-1 flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-slate-800 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            Cancel
          </button>
        )}
        <button
          onClick={submit}
          disabled={isBusy}
          className="flex-[2] rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition disabled:opacity-60"
        >
          {uploading
            ? "Uploading images…"
            : loading
              ? "Saving…"
              : initial?._id
                ? "Update Project"
                : "Create Project"}
        </button>
      </div>
    </div>
  );
};

// ── ProjectCard ─────────────────────────────────────────────────────────
interface CardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}
const ProjectCard: React.FC<CardProps> = ({ project, onEdit, onDelete }) => {
  const style = CATEGORY_STYLES[project.category];
  const techList = project.tech_stack ?? [];

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-slate-700">
      <div className="relative h-40 shrink-0 overflow-hidden">
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-950 text-3xl text-slate-800">
            🖼️
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${style.badge}`}
        >
          {project.category}
        </span>
        {project.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-slate-950">
            ★ Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-[15px] font-bold text-slate-100">
          {project.title}
        </div>
        <p className="text-xs font-semibold text-cyan-400">{project.summary}</p>
        {project.client_name && (
          <div className="text-xs text-slate-500">
            Client: {project.client_name}
          </div>
        )}

        {techList.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {techList.slice(0, 6).map((t) => (
              <span
                key={t.name}
                title={t.name}
                className="flex items-center gap-1 rounded-md bg-slate-800/80 px-1.5 py-1 text-[10px] text-slate-300"
              >
                {t.slug ? (
                  <img
                    src={techIconUrl(t.slug)}
                    alt=""
                    className="h-3 w-3"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : null}
                {t.name}
              </span>
            ))}
            {techList.length > 6 && (
              <span className="text-[10px] text-slate-600">
                +{techList.length - 6} more
              </span>
            )}
          </div>
        )}

        {(project.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags!.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-3 pt-1 text-xs">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              🔗 Live
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:underline"
            >
              ⌥ Code
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-800 p-3">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg bg-slate-800 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-slate-700"
        >
          ✎ Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 rounded-lg bg-rose-950/60 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-950"
        >
          ✕ Delete
        </button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const AddProject: React.FC = () => {
  const { token } = useContext(AuthContext);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tab, setTab] = useState<Tab>("display");
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<ProjectCategory | "All">("All");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProjects = useCallback(async () => {
    setPageLoading(true);
    try {
      const data = await api.getAll();
      setProjects(data);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to load projects",
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (project: Project) => {
    setFormLoading(true);
    try {
      const created = await api.create(project, token);
      setProjects((prev) => [...prev, created]);
      setTab("display");
      showToast("Project created!");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to create project",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (project: Project) => {
    if (!editProject?._id) return;
    setFormLoading(true);
    try {
      const updated = await api.update(editProject._id, project, token);
      setProjects((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x)),
      );
      setEditProject(null);
      setTab("display");
      showToast("Project updated!");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update project",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(deleteId, token);
      setProjects((prev) => prev.filter((x) => x._id !== deleteId));
      showToast("Project deleted.");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete project",
        "error",
      );
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setTab("create");
  };
  const cancelForm = () => {
    setEditProject(null);
    setTab("display");
  };

  const visibleProjects =
    filterCat === "All"
      ? projects
      : projects.filter((p) => p.category === filterCat);

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-200">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteId && (
        <ConfirmDialog
          message="Delete this project? This action can't be undone."
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteId(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 bg-[#070a14] px-6 py-5 sm:px-8">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Software Projects
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {pageLoading
              ? "Loading…"
              : `${projects.length} project${projects.length !== 1 ? "s" : ""} in portfolio`}
          </p>
        </div>

        <div className="flex overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {(["display", "create"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => (t === "display" ? cancelForm() : setTab(t))}
              className={`px-5 py-2.5 text-sm font-semibold transition ${
                tab === t
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "display"
                ? "📋 All Projects"
                : editProject
                  ? "✎ Edit Project"
                  : "+ New Project"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-10 sm:px-8">
        {tab === "create" && (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-slate-800 bg-[#070a14] p-6 sm:p-8">
              <h2 className="mb-6 flex items-center gap-2.5 text-base font-bold text-slate-100">
                <span className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 py-1 text-[11px] text-white">
                  {editProject ? "EDIT" : "NEW"}
                </span>
                {editProject ? editProject.title : "Create New Project"}
              </h2>
              <ProjectForm
                initial={editProject ?? undefined}
                onSave={editProject ? handleUpdate : handleCreate}
                onCancel={cancelForm}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {tab === "display" && (
          <>
            {!pageLoading && projects.length > 0 && (
              <div className="mb-7 flex flex-wrap gap-2">
                {FILTER_CATEGORIES.map((cat) => {
                  const active = filterCat === cat;
                  const activeCls =
                    cat === "All"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent"
                      : `${CATEGORY_STYLES[cat as ProjectCategory].solid} text-white border-transparent`;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCat(cat)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                        active
                          ? activeCls
                          : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {pageLoading ? (
              <div className="flex h-60 items-center justify-center gap-2.5 text-sm text-cyan-400">
                <span className="inline-block animate-spin text-xl">◌</span>
                Loading projects…
              </div>
            ) : projects.length === 0 ? (
              <div className="py-20 text-center text-slate-600">
                <div className="mb-4 text-5xl">📁</div>
                <p className="text-base">No projects yet.</p>
                <button
                  onClick={() => setTab("create")}
                  className="mt-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  + Add First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.map((p) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    onEdit={() => openEdit(p)}
                    onDelete={() => setDeleteId(p._id!)}
                  />
                ))}

                <div
                  onClick={() => setTab("create")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setTab("create")}
                  className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-800 text-slate-700 transition hover:border-cyan-500 hover:text-cyan-400"
                >
                  <span className="text-4xl">+</span>
                  <span className="text-sm font-semibold">Add New Project</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddProject;
