/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Tilt3D from "@/app/components/ui/Tilt3D";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useThemeStore } from "@/app/lib/store";
import Eyebrow from "@/app/Layout/Client/HeadingComponents/Eyebrow";
import SectionHeading from "@/app/Layout/Client/HeadingComponents/SectionHeading";

const API_BASE = `/api/v1/portfolio`;
const INITIAL_VISIBLE = 3;

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
  data: ProjectItem[];
  message: string;
}

const techIconUrl = (slug?: string) =>
  slug ? `https://cdn.simpleicons.org/${slug}` : "";

// ─── Theme (matches your site's existing cyan / slate palette) ────────────────

function buildTheme(dark: boolean) {
  return {
    heading: "text-ink",
    subtext: "text-ink-soft",
    bodyTxt: "text-ink-soft",
    skeletonBase: "bg-surface",
    rowBdr: "border-line",
    imgRing: "ring-line",
    chipBg: "bg-surface",
    chipTxt: "text-ink-soft",
    chipBdr: "border-line",
    detailsBdr: "border-line text-ink-soft",
    numberBg: "bg-card",
    numberTxt: "text-accent",
    imgFallback: dark
      ? "from-accent/25 via-blue-600/15 to-slate-900"
      : "from-accent-soft via-accent-soft to-slate-100",
    divider: "bg-surface",
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonRows = ({ dark }: { dark: boolean }) => {
  const t = buildTheme(dark);
  return (
    <div className="max-width mx-auto w-full px-4 sm:px-6 md:px-10 flex flex-col gap-10 md:gap-14">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid md:grid-cols-2 gap-6 md:gap-14 items-center"
        >
          <div
            className={`rounded-2xl animate-pulse ${t.skeletonBase}`}
            style={{ aspectRatio: "4/3" }}
          />
          <div className="flex flex-col gap-3">
            <div
              className={`h-4 w-24 rounded animate-pulse ${t.skeletonBase}`}
            />
            <div
              className={`h-7 w-2/3 rounded animate-pulse ${t.skeletonBase}`}
            />
            <div
              className={`h-3 w-full rounded animate-pulse ${t.skeletonBase}`}
            />
            <div
              className={`h-3 w-5/6 rounded animate-pulse ${t.skeletonBase}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Error / Empty states ──────────────────────────────────────────────────────

const ErrorState = ({
  message,
  onRetry,
  dark,
}: {
  message: string;
  onRetry: () => void;
  dark: boolean;
}) => (
  <div className="flex flex-col items-center gap-4 py-16 px-4 text-center">
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
        Failed to load projects
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

const EmptyState = () => (
  <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
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
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </div>
    <p className={`text-sm ${"text-ink-muted"}`}>
      No projects yet. Check back soon.
    </p>
  </div>
);

// ─── Icons ──────────────────────────────────────────────────────────────────

const ArrowUpRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    className="w-3.5 h-3.5"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const ArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    className="w-3.5 h-3.5"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronUp = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    className="w-3.5 h-3.5"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// ─── Project Row (image | content, alternating sides, own scroll-in animation) ─

const ProjectRow = ({
  item,
  index,
  dark,
}: {
  item: ProjectItem;
  index: number;
  dark: boolean;
}) => {
  const t = buildTheme(dark);
  const rowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const reversed = index % 2 === 1; // odd rows: image on the right
  const techList = item.tech_stack ?? [];

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-14 items-center"
    >
      {/* ── Image ── */}
      <div
        className={`relative ${reversed ? "md:order-2" : "md:order-1"}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) translateX(0)"
            : `translateY(24px) translateX(${reversed ? "16px" : "-16px"})`,
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <Tilt3D
          max={6}
          lift={16}
          className={`relative rounded-2xl overflow-hidden ring-1 ${t.imgRing} shadow-e3`}
          style={{ aspectRatio: "4/3" }}
        >
          {!imgError && item.cover_image ? (
            <img
              src={item.cover_image}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
              style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${t.imgFallback}`}
            />
          )}

          {/* subtle top-to-bottom tint for legibility of number badge */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />

          {/* glint sweep on hover */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.10) 45%, transparent 60%)",
              transform: hovered ? "translateX(120%)" : "translateX(-120%)",
              transition: "transform 0.7s ease",
            }}
          />

          {/* number badge — inset on mobile, pops half-outside on desktop */}
          <span
            className={`absolute top-3 md:-top-3 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-[11px] md:text-xs font-extrabold ring-1 ${t.imgRing} ${t.numberBg} ${t.numberTxt} shadow-lg ${
              reversed ? "right-3 md:-right-3" : "left-3 md:-left-3"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </Tilt3D>
      </div>

      {/* ── Content ── */}
      <div
        className={`${reversed ? "md:order-1" : "md:order-2"}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) translateX(0)"
            : `translateY(24px) translateX(${reversed ? "-16px" : "16px"})`,
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-[2px] bg-accent-solid rounded-full shrink-0" />
          <span className="text-accent text-[11px] font-bold tracking-[0.14em] uppercase">
            {item.category}
          </span>
        </div>

        <h3
          className={`text-xl sm:text-2xl md:text-[30px] font-extrabold leading-tight mb-3 ${t.heading}`}
        >
          {item.title}
        </h3>

        <p
          className={`text-[16px] sm:text-[18px] md:text-[20px] line-clamp-3  mb-5 ${t.bodyTxt} font-bold`}
        >
          {item.problem_statement}
        </p>
        <p
          className={`text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed mb-5 ${t.bodyTxt}`}
        >
          {item.summary}
        </p>

        {techList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {techList.map((tech) => (
              <span
                key={tech.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium ${t.chipBg} ${t.chipTxt} ${t.chipBdr}`}
              >
                {tech.slug && (
                  <img
                    src={techIconUrl(tech.slug)}
                    alt=""
                    className="h-3 w-3 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                )}
                {tech.name}
              </span>
            ))}
            <span
          
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium ${t.chipBg} ${t.chipTxt} ${t.chipBdr}`}
            >
             
           Others...
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {item.live_url && (
            <Link
              href={item.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold bg-accent-solid hover:bg-accent-strong text-ink-contrast shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Live demo
              <ArrowUpRight />
            </Link>
          )}

          <Link
            href={`/project/${item._id}`}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold border transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent ${t.detailsBdr}`}
          >
            Details
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Projects() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";
  const t = buildTheme(dark);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchProjects = async () => {
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

      setItems(json.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const hasMore = items.length > INITIAL_VISIBLE;

  const handleToggle = () => {
    if (showAll) {
      // collapsing: scroll back up to the section so the user isn't left
      // staring at a spot below the now-shorter list
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowAll(false);
    } else {
      setShowAll(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="w-full px-3 md:px-0 relative overflow-hidden"
    >
      {/* ── Eyebrow + Headline ── */}
      <div
        className={`flex flex-col items-center text-center mb-10 md:mb-14 transition-all duration-700 ${
          headerVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
        }`}
      >
        <Eyebrow label={"Projects"} />
        <SectionHeading highlight={"Work"}> {"My Latest"} {" "}</SectionHeading>
        <p
          className={`${t.subtext} text-sm sm:text-base max-w-xl leading-relaxed px-2`}
        >
          {
            "A look at the web apps, mobile apps, and digital products we've shipped — built with modern tech and designed to solve real business problems."
          }
        </p>
      </div>

      {/* ── Rows / States ── */}
      {loading ? (
        <SkeletonRows dark={dark} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjects} dark={dark} />
      ) : items.length === 0 ? (
        <EmptyState  />
      ) : (
        <div className="max-width mx-auto w-full px-4 sm:px-6 md:px-10 flex flex-col gap-12 sm:gap-16 md:gap-24">
          {visibleItems.map((item, i) => (
            <React.Fragment key={item._id}>
              <ProjectRow item={item} index={i} dark={dark} />
              {i < visibleItems.length - 1 && (
                <div className={`h-px w-full ${t.divider}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── View all / Show less — same place, no navigation ── */}
      {!loading && !error && hasMore && (
        <div className="flex justify-center mt-12 md:mt-20 px-4">
          <button
            onClick={handleToggle}
            className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full text-[13px] font-bold border border-accent/40 text-accent hover:bg-accent-strong hover:text-ink-contrast transition-all duration-200 hover:-translate-y-0.5"
          >
            {showAll ? "Show less" : "View all projects"}
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              {showAll ? <ChevronUp /> : <ArrowRight />}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}