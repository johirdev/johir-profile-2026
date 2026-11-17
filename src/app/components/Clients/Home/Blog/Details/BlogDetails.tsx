/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/app/lib/store";
import { useParams } from "next/navigation";

const API_BASE = `/api/v1/blog`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Blog {
  _id: string;
  title: string;
  category: string;
  cover_image: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_image: string;
  tags: string[];
  read_time: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  data: Blog;
  message: string;
}

// ─── Theme builder ────────────────────────────────────────────────────────────

function buildTheme() {
  return {
    pageBg: "bg-page",
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    subtext: "text-ink-soft",
    cardBg: "bg-card",
    cardBdr: "border-line",
    tagBg: "bg-accent-soft",
    tagTxt: "text-accent",
    statBg: "bg-surface",
    statBdr: "border-line",
    statTxt: "text-accent",
    metaBdr: "border-line",
    metaText: "text-ink-muted",
    authorName: "text-ink",
    avatarRing: "ring-accent-line",
    avatarFallbackBg: "bg-accent-soft",
    avatarFallbackText: "text-accent",
    skeletonBase: "bg-surface",
    contentText: "text-ink-soft",
    divider: "border-line",
    backBtn: "text-ink-soft hover:text-accent hover:bg-accent-soft",
    excerptBg: "bg-accent-soft border-accent-line",
    excerptText: "text-ink-soft",
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlogDetailsProps {
  /** The blog _id or slug to fetch */
  id: string;
  /** Called when the user clicks ← Back */
  onBack?: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => {
  const t = buildTheme();
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6">
      {/* Cover */}
      <div className={`w-full h-72 rounded-2xl ${t.skeletonBase}`} />
      {/* Category + read time */}
      <div className="flex gap-3">
        <div className={`h-6 w-24 rounded-lg ${t.skeletonBase}`} />
        <div className={`h-6 w-20 rounded-lg ${t.skeletonBase}`} />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className={`h-8 rounded w-full ${t.skeletonBase}`} />
        <div className={`h-8 rounded w-3/4 ${t.skeletonBase}`} />
      </div>
      {/* Author row */}
      <div className={`flex items-center gap-3 py-4 border-y ${t.divider}`}>
        <div className={`w-10 h-10 rounded-full ${t.skeletonBase}`} />
        <div className="space-y-1.5 flex-1">
          <div className={`h-3 w-28 rounded ${t.skeletonBase}`} />
          <div className={`h-3 w-20 rounded ${t.skeletonBase}`} />
        </div>
      </div>
      {/* Body lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 rounded ${t.skeletonBase}`}
          style={{ width: `${75 + (i % 3) * 10}%` }}
        />
      ))}
      {/* Tags */}
      <div className="flex gap-2 pt-2">
        {[80, 100, 90].map((w, i) => (
          <div
            key={i}
            className={`h-6 rounded-md ${t.skeletonBase}`}
            style={{ width: `${w}px` }}
          />
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
  <div className="flex flex-col items-center gap-4 py-20">
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center ${
        dark ? "bg-red-500/10" : "bg-red-50"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-7 h-7 text-red-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
    <div className="text-center">
      <p
        className={`text-sm font-medium ${"text-ink"}`}
      >
        Failed to load this post
      </p>
      <p
        className={`text-xs mt-1 ${"text-ink-muted"}`}
      >
        {message}
      </p>
    </div>
    <button
      onClick={onRetry}
      className="px-5 py-2 rounded-full text-xs font-semibold tracking-wide bg-accent-solid hover:bg-accent-strong text-ink-contrast transition-colors duration-150"
    >
      Try again
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BlogDetails() {
  const { id } = useParams(); // URL: /564654545456444
  const { theme } = useThemeStore();
  const dark = theme === "dark";
  const t = buildTheme();

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // ── Fetch single blog ──────────────────────────────────────────────────────
  const fetchBlog = async () => {
    setLoading(true);
    setError(null);
    setImgError(false);
    setAvatarError(false);
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

      setBlog(json.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Intersection observer for fade-in ─────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.03 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const initials = blog?.author_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = blog
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <section
      ref={sectionRef}
      className={`w-full min-h-screen px-6 md:px-10 pb-24 md:pb-32 pt-20`}
    >
      <div className="max-w-3xl mx-auto">
        {/* ── Back button ─────────────────────────────────────────────────── */}
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${t.backBtn}`}
        >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to blog
          </button>
       

        {/* ── States ──────────────────────────────────────────────────────── */}
        {loading && <Skeleton />}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchBlog} dark={dark} />
        )}

        {/* ── Article ─────────────────────────────────────────────────────── */}
        {!loading && !error && blog && (
          <article
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            {/* ── Cover Image ─────────────────────────────────────────────── */}
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-slate-200 dark:bg-[#0a1628]">
              {/* Gradient fallback */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-accent/30 via-blue-600/20 to-transparent"
                aria-hidden
              />
              {!imgError && blog.cover_image && (
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              )}
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
              {/* Category badge */}
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[11px] font-bold tracking-[0.12em] uppercase ${t.tagBg} ${t.tagTxt} backdrop-blur-sm`}
              >
                {blog.category}
              </span>
            </div>

            {/* ── Meta: read time ─────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${t.statBdr} ${t.statBg} w-fit`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-solid shrink-0" />
                <span
                  className={`text-[11px] font-bold tracking-wide ${t.statTxt}`}
                >
                  {blog.read_time}
                </span>
              </div>
            </div>

            {/* ── Title ───────────────────────────────────────────────────── */}
            <h1
              className={`text-2xl md:text-4xl font-extrabold leading-tight tracking-tight mb-6 ${t.heading}`}
            >
              {blog.title}
            </h1>

            {/* ── Author + Date row ────────────────────────────────────────── */}
            <div
              className={`flex items-center gap-3 py-4 border-y ${t.divider} mb-8`}
            >
              {/* Avatar */}
              {!avatarError && blog.author_image ? (
                <img
                  src={blog.author_image}
                  alt={blog.author_name}
                  width={40}
                  height={40}
                  onError={() => setAvatarError(true)}
                  className={`w-10 h-10 rounded-full object-cover ring-2 ${t.avatarRing} shrink-0`}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold ring-2 ${t.avatarRing} ${t.avatarFallbackBg} ${t.avatarFallbackText} shrink-0`}
                >
                  {initials}
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <span className={`text-[13px] font-semibold ${t.authorName}`}>
                  {blog.author_name}
                </span>
                <span className={`text-[12px] ${t.metaText}`}>
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* ── Excerpt callout ──────────────────────────────────────────── */}
            <div className={`border rounded-xl p-4 md:p-5 mb-8 ${t.excerptBg}`}>
              <p
                className={`text-[14px] leading-relaxed font-medium italic ${t.excerptText}`}
              >
                {blog.excerpt}
              </p>
            </div>

            {/* ── Body content ─────────────────────────────────────────────── */}
            <div
              className={`text-[15px] leading-[1.85] ${t.contentText} space-y-4 mb-10`}
            >
              {blog.content
                .split("\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <div className={`h-px w-full border-t ${t.divider} mb-6`} />

            {/* ── Tags ────────────────────────────────────────────────────── */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-[12px] font-semibold ${t.metaText} self-center mr-1`}
                >
                  Tags:
                </span>
                {blog.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`text-[11px] px-2.5 py-1 rounded-lg ${t.tagBg} ${t.tagTxt} font-medium`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </div>
    </section>
  );
}
