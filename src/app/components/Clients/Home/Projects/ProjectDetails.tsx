
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useThemeStore } from "@/app/lib/store";
import Eyebrow from "@/app/Layout/Client/HeadingComponents/Eyebrow";

const API_BASE = `/api/v1/portfolio`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TechStackItem {
  name: string;
  slug?: string;
}

interface ProjectItem {
  _id: string;
  title: string;
  category: string;
  summary: string;
  problem_statement?: string;
  description?: string;
  client_name?: string;
  cover_image: string;
  image_2?: string;
  image_3?: string;
  tech_stack?: TechStackItem[];
  live_url?: string;
  github_url?: string;
  tags?: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  data: ProjectItem;
  message: string;
}

const techIconUrl = (slug?: string) =>
  slug ? `https://cdn.simpleicons.org/${slug}` : "";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// ─── Theme ────────────────────────────────────────────────────────────────────

function buildTheme() {
  return {
    pageBg: "bg-card",
    heading: "text-ink",
    body: "text-ink-soft",
    bodyStrong: "text-ink-soft",
    cardBg: "bg-card",
    cardBdr: "border-line",
    cardShadow: "shadow-e1",
    pillBg: "bg-surface",
    pillTxt: "text-ink-soft",
    divider: "border-line",
    skeletonBase: "bg-surface",
    thumbRing: "ring-line",
    thumbActiveRing: "ring-accent-line",
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const DetailSkeleton = () => {
  const t = buildTheme();
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-24 animate-pulse">
      <div className={`h-4 w-28 rounded-full ${t.skeletonBase} mb-6`} />
      <div className={`h-10 w-2/3 rounded-lg ${t.skeletonBase} mb-3`} />
      <div className={`h-10 w-1/3 rounded-lg ${t.skeletonBase} mb-10`} />
      <div className={`w-full rounded-3xl ${t.skeletonBase}`} style={{ aspectRatio: "16/8" }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-24 rounded-2xl ${t.skeletonBase}`} />
        ))}
      </div>
    </div>
  );
};

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({
  message,
  onRetry,
  dark,
}: {
  message: string;
  onRetry: () => void;
  dark: boolean;
}) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center ${
        dark ? "bg-red-500/10" : "bg-red-50"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-red-400">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
    <div>
      <p className={`text-base font-semibold ${"text-ink"}`}>
        Couldn&apos;t load this project
      </p>
      <p className={`text-sm mt-1 ${"text-ink-muted"}`}>{message}</p>
    </div>
    <div className="flex items-center gap-3 mt-2">
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide bg-accent-solid hover:bg-accent-strong text-ink-contrast transition-colors duration-150"
      >
        Try again
      </button>
      <Link
        href="/#projects"
        className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide border transition-colors duration-150 ${
          "border-line text-ink-soft hover:border-accent-line"
        }`}
      >
        Back to projects
      </Link>
    </div>
  </div>
);

// ─── Stat Card (signature element row) ────────────────────────────────────────

const StatCard = ({
  label,
  value,
  dark,
  icon,
}: {
  label: string;
  value: string;
  dark: boolean;
  icon: React.ReactNode;
}) => {
  const t = buildTheme();
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${t.cardBdr} ${t.cardBg} ${t.cardShadow} p-4 sm:p-5`}
    >
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
      />
      <div className="relative flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-[10px] font-bold tracking-[0.12em] uppercase ${t.pillTxt}`}>
            {label}
          </p>
          <p className={`text-sm sm:text-base font-bold truncate ${t.heading}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Prose Card (Problem / Description) ───────────────────────────────────────

const ProseCard = ({
  eyebrow,
  title,
  text,
  dark,
}: {
  eyebrow: string;
  title: string;
  text: string;
  dark: boolean;
}) => {
  const t = buildTheme();
  return (
    <div className={`rounded-3xl border ${t.cardBdr} ${t.cardBg} ${t.cardShadow} p-6 sm:p-8 md:p-10`}>
      <span
        className={`inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-accent mb-4`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent-solid" />
        {eyebrow}
      </span>
      <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 ${t.heading}`}>{title}</h3>
      <p className={`text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line ${t.bodyStrong}`}>
        {text}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectDetails() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";
  const t = buildTheme();

  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const json: ApiResponse = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Unexpected API error");
      }

      setProject(json.data);
      setActiveImage(json.data.cover_image);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen `}>
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={`min-h-screen `}>
        <ErrorState message={error || "Project not found"} onRetry={fetchProject} dark={dark} />
      </div>
    );
  }

  const techList = project.tech_stack ?? [];
  const gallery = [project.cover_image, project.image_2, project.image_3].filter(
    (src): src is string => Boolean(src),
  );

  return (
    <div className={` min-h-screen  font-poppins`}>
      {/* ── Ambient glow — echoes hero section language ── */}
      <div className="relative">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-30 blur-3xl"
          style={{
            background: dark
              ? "radial-gradient(circle, rgba(6,182,212,0.25), transparent 70%)"
              : "radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-24 md:pt-28 ">
          {/* ── Breadcrumb / Back ── */}
          <div
            className={`flex items-center gap-2 mb-6 transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <button
              onClick={() => router.back()}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t.body} hover:text-accent transition-colors duration-150`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to projects
            </button>
          </div>

          {/* ── Eyebrow + Title ── */}
          <div
            className={`flex flex-col items-start gap-4 mb-8 transition-all duration-700 delay-75 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Eyebrow label={project.category} />
              {project.featured && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500 text-slate-950">
                  ★ Featured
                </span>
              )}
            </div>

            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight ${t.heading}`}
            >
              {project.title}
            </h1>

            {project.summary && (
              <p
                className={`text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed ${t.body}`}
              >
                {project.summary}
              </p>
            )}

            {/* ── CTA row ── */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-accent-solid hover:bg-accent-strong text-ink-contrast font-bold text-sm transition-colors duration-150 shadow-lg shadow-accent/20"
                >
                  Visit Live Site
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="w-4 h-4"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full border font-bold text-sm transition-colors duration-150 ${
                    "border-line text-ink-soft hover:border-accent-line"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  View Code
                </a>
              )}
            </div>
          </div>

          {/* ── Signature stat-card row ── */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12 transition-all duration-700 delay-150 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <StatCard
              dark={dark}
              label="Category"
              value={project.category}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h.75m0 0h15a1.5 1.5 0 0 1 1.5 1.5v9.75a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5z"
                  />
                </svg>
              }
            />
            <StatCard
              dark={dark}
              label="Client"
              value={project.client_name || "Internal"}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z"
                  />
                </svg>
              }
            />
            <StatCard
              dark={dark}
              label="Tech Used"
              value={`${techList.length} ${techList.length === 1 ? "Tool" : "Tools"}`}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25z"
                  />
                </svg>
              }
            />
            <StatCard
              dark={dark}
              label="Delivered"
              value={formatDate(project.updatedAt || project.createdAt) || "—"}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              }
            />
          </div>

          {/* ── Gallery: large image + thumbnail rail ── */}
          {gallery.length > 0 && (
            <div
              className={`mb-14 transition-all duration-700 delay-200 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <div
                className={`relative w-full rounded-3xl overflow-hidden border ${t.cardBdr} ${t.cardShadow}`}
                style={{ aspectRatio: "16/9" }}
              >
                <img
                  src={activeImage || gallery[0]}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              {gallery.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(src)}
                      className={`relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden ring-2 transition-all duration-150 ${
                        activeImage === src ? t.thumbActiveRing : t.thumbRing
                      }`}
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={src}
                        alt={`${project.title} preview ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Problem + Description prose cards ── */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {project.problem_statement && (
              <ProseCard
                dark={dark}
                eyebrow="The Challenge"
                title="Problem Statement"
                text={project.problem_statement}
              />
            )}
            {project.description && (
              <ProseCard
                dark={dark}
                eyebrow="Our Approach"
                title="What We Built"
                text={project.description}
              />
            )}
          </div>

          {/* ── Tech stack ── */}
          {techList.length > 0 && (
            <div
              className={`mb-14 transition-all duration-700 delay-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-accent mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-solid" />
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-3">
                {techList.map((tech) => (
                  <div
                    key={tech.name}
                    className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${t.cardBdr} ${t.cardBg} hover:border-accent/40 transition-colors duration-150`}
                  >
                    {tech.slug && (
                      <img
                        src={techIconUrl(tech.slug)}
                        alt=""
                        className="h-4 w-4"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    )}
                    <span className={`text-sm font-semibold ${t.heading}`}>
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tags ── */}
          {project.tags && project.tags.length > 0 && (
            <div
              className={`mb-14 transition-all duration-700 delay-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${t.pillBg} ${t.pillTxt}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer CTA ── */}
          <div
            className={`relative overflow-hidden rounded-3xl border ${t.cardBdr} ${t.cardBg} p-8 sm:p-12 mb-20 text-center transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(6,182,212,0.15), transparent 60%)",
              }}
            />
            <div className="relative">
              <h3
                className={`text-2xl sm:text-3xl font-bold mb-3 ${t.heading}`}
              >
                Want results like this for your business?
              </h3>
              <p
                className={`text-sm sm:text-base max-w-xl mx-auto mb-6 ${t.body}`}
              >
                Let&apos;s talk about your project and how we can help you ship
                something just as polished.
              </p>
              <Link
                href="/start-a-project"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-accent-solid hover:bg-accent-strong text-ink-contrast font-bold text-sm transition-colors duration-150 shadow-lg shadow-accent/20"
              >
                Start Your Project
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="w-4 h-4"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}