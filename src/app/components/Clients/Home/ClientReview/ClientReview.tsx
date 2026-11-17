/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/app/lib/store";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Eyebrow from "@/app/Layout/Client/HeadingComponents/Eyebrow";
import SectionHeading from "@/app/Layout/Client/HeadingComponents/SectionHeading";


const API_BASE = `/api/v1/reviews`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  _id: string;
  reviewer_name: string;
  reviewer_role: string;
  reviewer_image: string;
  rating: number;
  review_text: string;
  badge_label: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  data: Review[];
  message: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.5}
    className={`w-[18px] h-[18px] ${filled ? "text-amber-400" : "text-slate-400"}`}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M0 24V14.4C0 6.72 4.32 1.92 12.96 0l1.44 2.4C9.6 3.84 7.2 6.72 6.72 10.56H12V24H0zm18 0V14.4C18 6.72 22.32 1.92 30.96 0l1.44 2.4C27.6 3.84 25.2 6.72 24.72 10.56H30V24H18z" />
  </svg>
);

// ─── Skeleton (spotlight layout) ───────────────────────────────────────────────

const SkeletonSpotlight = () => (
  <div
    className={`${
      "bg-card border-line"
    } border rounded-3xl p-6 sm:p-10 md:p-12 animate-pulse`}
  >
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
      <div
        className={`w-full sm:w-[220px] aspect-square sm:aspect-[4/5] rounded-2xl shrink-0 ${
          "bg-surface"
        }`}
      />
      <div className="flex-1 flex flex-col gap-4 w-full">
        <div
          className={`w-9 h-7 rounded ${"bg-surface"}`}
        />
        <div className="flex flex-col gap-2.5">
          <div
            className={`h-4 rounded w-full ${"bg-surface"}`}
          />
          <div
            className={`h-4 rounded w-full ${"bg-surface"}`}
          />
          <div
            className={`h-4 rounded w-4/5 ${"bg-surface"}`}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div
            className={`h-4 w-40 rounded ${"bg-surface"}`}
          />
          <div
            className={`h-3 w-56 rounded ${"bg-surface"}`}
          />
        </div>
      </div>
    </div>
  </div>
);

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
        Failed to load reviews
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
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    </div>
    <p className={`text-sm ${"text-ink-muted"}`}>
      No reviews yet. Check back soon.
    </p>
  </div>
);

// ─── Spotlight Review Card ─────────────────────────────────────────────────────

const ReviewSpotlightCard = ({
  review,
  t,
}: {
  review: Review;
  t: ReturnType<typeof buildTheme>;
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = review.reviewer_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden ${t.cardBg} border ${t.cardBdr} rounded-3xl p-6 sm:p-10 md:p-12`}
    >
      {/* Ambient accent glow */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-64 h-52 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #06b6d4, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
        {/* ── Portrait image ── */}
        <div className="w-full sm:w-[220px] md:w-[240px] shrink-0">
          {imgError || !review.reviewer_image ? (
            <div
              className={`w-full aspect-square sm:aspect-[4/5] rounded-2xl flex items-center justify-center text-4xl font-bold ${t.avatarFallbackBg} ${t.avatarFallbackText}`}
            >
              {initials}
            </div>
          ) : (
            <img
              src={review.reviewer_image}
              alt={review.reviewer_name}
              onError={() => setImgError(true)}
              className="w-full aspect-square sm:aspect-[4/5] rounded-2xl object-cover"
            />
          )}
        </div>

        {/* ── Quote + text + author ── */}
        <div className="flex-1 min-w-0">
          <QuoteIcon className={`w-9 h-7 ${t.quoteColor} mb-4`} />

          {review.rating > 0 && (
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, s) => (
                <StarIcon key={s} filled={s < review.rating} />
              ))}
            </div>
          )}

          <p
            className={`${t.reviewText} line-clamp-6 text-[14px] md:text-[18px] font-medium leading-relaxed`}
          >
            {review.review_text}
          </p>

          {review.badge_label && (
            <span
              className={`inline-flex mt-5 text-[11px] font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full ${t.metricBg}`}
            >
              {review.badge_label}
            </span>
          )}

          <div className={`mt-7 pt-6 border-t ${t.dividerBdr}`}>
            <p
              className={`text-[14px] md:text-[18px] font-bold ${t.nameText} leading-tight`}
            >
              {review.reviewer_name}
            </p>
            <p
              className={`text-sm sm:text-[15px] ${t.roleText} leading-tight mt-1`}
            >
              {review.reviewer_role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Theme builder ────────────────────────────────────────────────────────────

function buildTheme(dark: boolean) {
  return {
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    subheading: "text-ink-soft",
    cardBg: "bg-card",
    cardBdr: "border-line",
    quoteColor: "text-accent/40",
    reviewText: "text-ink",
    nameText: "text-ink",
    roleText: "text-ink-muted",
    metricBg: "bg-accent-soft text-accent",
    avatarFallbackBg: "bg-accent-soft",
    avatarFallbackText: "text-accent",
    dividerBdr: "border-line",
    paginationActive: dark ? "#22d3ee" : "#0891b2",
    paginationInactive: dark ? "#1a3050" : "#cbd5e1",
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientReview() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";
  const t = buildTheme(dark);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch reviews ──────────────────────────────────────────────────────────
  const fetchReviews = async () => {
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

      setReviews(json.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ── Intersection observer for entrance animation ───────────────────────────
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

  const shouldLoop = reviews.length > 1;

  return (
    <section
      ref={sectionRef}
      id="client-reviews"
      className="w-full px-6 md:px-10 pb-24 md:pb-32"
    >
      {/* ── Eyebrow + Headline ─────────────────────────────────────────────── */}
      <div
        className={`flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <Eyebrow label={"Client Feedback"} />

        <SectionHeading highlight={"Reviews"}>{"My Client "}</SectionHeading>
      </div>

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <div
        className={`max-w-5xl mx-auto transition-all duration-700 delay-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {loading ? (
          <SkeletonSpotlight  />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchReviews} dark={dark} />
        ) : reviews.length === 0 ? (
          <EmptyState  />
        ) : (
          <>
            <style>{`
              .review-swiper .swiper-pagination-bullet {
                background: ${t.paginationInactive};
                opacity: 1;
                width: 8px;
                height: 8px;
                transition: all 0.3s ease;
              }
              .review-swiper .swiper-pagination-bullet-active {
                background: ${t.paginationActive};
                width: 24px;
                border-radius: 4px;
              }
              .review-swiper .swiper-pagination {
                position: relative;
                margin-top: 28px;
              }
              .review-swiper .swiper-slide {
                height: auto;
              }
            `}</style>

            <Swiper
              className="review-swiper"
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              loop={shouldLoop}
            >
              {reviews.map((review) => (
                <SwiperSlide key={review._id} className="!h-auto">
                  <ReviewSpotlightCard review={review} t={t} />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}
      </div>
    </section>
  );
}
