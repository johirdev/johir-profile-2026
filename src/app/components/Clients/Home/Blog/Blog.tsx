/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/app/lib/store";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Eyebrow from "@/app/Layout/Client/HeadingComponents/Eyebrow";
import SectionHeading from "@/app/Layout/Client/HeadingComponents/SectionHeading";

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
  data: Blog[];
  message: string;
}

// ─── Theme builder ────────────────────────────────────────────────────────────

function buildTheme(dark: boolean) {
  return {
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    subtext: "text-ink-soft",
    cardBg: "bg-card",
    cardBdr: "border-line",
    cardHover: "hover:border-accent-line hover:bg-card-hover hover:shadow-e3",
    tagBg: "bg-accent-soft",
    tagTxt: "text-accent",
    cardTitle: "text-ink",
    cardDesc: "text-ink-soft",
    statBg: "bg-surface",
    statBdr: "border-line",
    statTxt: "text-accent",
    imgOverlay: dark
      ? "from-[#0f1e35] via-transparent"
      : "from-white/10 via-transparent",
    metaBdr: "border-line",
    metaText: "text-ink-muted",
    authorName: "text-ink",
    avatarRing: "ring-accent-line",
    avatarFallbackBg: "bg-accent-soft",
    avatarFallbackText: "text-accent",
    skeletonBase: "bg-surface",
    paginationActive: dark ? "#22d3ee" : "#0891b2",
    paginationInactive: dark ? "#1a3050" : "#cbd5e1",
  };
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = ({ dark }: { dark: boolean }) => {
  const t = buildTheme(dark);
  return (
    <div
      className={`${t.cardBg} border ${t.cardBdr} rounded-2xl overflow-hidden flex flex-col animate-pulse h-full`}
    >
      <div className={`w-full aspect-[16/10] ${t.skeletonBase}`} />
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className={`h-3 w-20 rounded ${t.skeletonBase}`} />
          <div className="flex items-center gap-2">
            <div
              className={`w-[26px] h-[26px] rounded-full ${t.skeletonBase}`}
            />
            <div className={`h-3 w-16 rounded ${t.skeletonBase}`} />
          </div>
        </div>
        <div className={`h-4 rounded w-3/4 ${t.skeletonBase}`} />
        <div className={`h-3 rounded w-full ${t.skeletonBase}`} />
        <div className={`h-3 rounded w-5/6 ${t.skeletonBase}`} />
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
  <div className="flex flex-col items-center gap-4 py-16">
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
        Failed to load blog posts
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

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center gap-3 py-16">
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center ${
        "bg-accent-soft"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-7 h-7 text-accent"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    </div>
    <p className={`text-sm ${"text-ink-muted"}`}>
      No blog posts yet. Check back soon.
    </p>
  </div>
);

// ─── Blog Card ────────────────────────────────────────────────────────────────

const BlogCard = ({
  blog,
  t,
  index,
  visible,
}: {
  blog: Blog;
  t: ReturnType<typeof buildTheme>;
  index: number;
  visible: boolean;
}) => {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
 

  // Format date
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${blog._id}`}
      className={`group ${t.cardBg} border ${t.cardBdr} ${t.cardHover} rounded-sm overflow-hidden transition-all duration-300 flex flex-col h-full`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ease ${index * 70}ms, transform 0.55s ease ${index * 70}ms, background 0.2s, border-color 0.2s, box-shadow 0.2s`,
      }}
    >
      {/* ── Cover image — fixed aspect ratio, identical across every card ── */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-[#0a1628] shrink-0">
        {/* Gradient fallback */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-accent/30 via-blue-600/20 to-transparent"
          aria-hidden
        />

        {!imgError && blog.cover_image && (
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* Bottom fade */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${t.imgOverlay} to-transparent`}
        />

        {/* Category badge */}
        {/* <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.12em] uppercase ${t.tagBg} ${t.tagTxt} backdrop-blur-sm`}
        >
          {blog.category}
        </span> */}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Date (left) + Author avatar & name (right) — sits right under the cover image */}
        <div className="flex items-center justify-between gap-2">
          <div className={`text-[11.5px] font-medium ${t.metaText} shrink-0`}>
            {blog?.read_time}
          </div>

          <span className={`text-[11.5px] font-medium ${t.metaText} shrink-0`}>
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-[15px] leading-snug ${t.cardTitle} line-clamp-2`}
        >
          {blog.title}
        </h3>

        {/* Excerpt */}
        {blog.excerpt && (
          <p
            className={`text-[12.5px] leading-relaxed ${t.cardDesc} line-clamp-2`}
          >
            {blog.excerpt}
          </p>
        )}

        {/* Tags — show first 2 only, pinned toward the bottom for equal-height cards */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {blog.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-0.5 rounded-md ${t.tagBg} ${t.tagTxt} font-medium truncate max-w-[140px]`}
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 2 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md ${t.statBg} ${t.metaText} font-medium border ${t.statBdr}`}
              >
                +{blog.tags.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServicesBlock() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";
  const t = buildTheme(dark);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);


  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch blogs ────────────────────────────────────────────────────────────
  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
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

      setBlogs(json.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ── Intersection observer ──────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Use a slider once there are more posts than fit a single grid row ──────
  const useSlider = blogs.length >= 4;

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="w-full px-6 md:px-10 pb-24 md:pb-32"
    >
      {/* ── Eyebrow + Headline ─────────────────────────────────────────────── */}
      <div
        className={`flex flex-col items-center text-center mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`flex flex-col items-center text-center   transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <Eyebrow label={"Blog"} />

          <SectionHeading highlight={"Insights"}>
            {"Latest Tech "}
          </SectionHeading>
        </div>
        <p className={`text-base ${t.subtext} max-w-lg`}>
          {
            "Sharing my experiences, technical knowledge, and lessons learned while building modern web applications."
          }
        </p>
      </div>

      {/* ── Grid / Slider ─────────────────────────────────────────────────── */}
      <div className="max-width mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} dark={dark} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchBlogs} dark={dark} />
        ) : blogs.length === 0 ? (
          <EmptyState  />
        ) : useSlider ? (
          <>
            <style>{`
              .blog-swiper .swiper-pagination-bullet {
                background: ${t.paginationInactive};
                opacity: 1;
                width: 8px;
                height: 8px;
                transition: all 0.3s ease;
              }
              .blog-swiper .swiper-pagination-bullet-active {
                background: ${t.paginationActive};
                width: 24px;
                border-radius: 4px;
              }
              .blog-swiper .swiper-pagination {
                position: relative;
                margin-top: 28px;
              }
              .blog-swiper .swiper-slide {
                height: auto;
              }
            `}</style>

            <Swiper
              className="blog-swiper"
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1.08}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
              }}
              autoplay={{
                delay: 3800,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              loop
            >
              {blogs.map((blog, i) => (
                <SwiperSlide key={blog._id} className="!h-auto">
                  <BlogCard blog={blog} t={t} index={i} visible={visible} />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.map((blog, i) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                t={t}
                index={i}
                visible={visible}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
