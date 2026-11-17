/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/app/lib/store";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import config from "@/app/config/Config";
import Link from "next/link";

const API_BASE = `${config.API_URL}/prices`;

// ─── Types ───────────────────────────────────────────────────────────────────
interface PricingPlan {
  _id: string;
  price_heading: string;
  price_amount: number;
  active_mostpopular: boolean;
  contact: string;
  features: string[];
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const CheckIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0 mt-[2px]">
    <circle cx="10" cy="10" r="10" fill={color} fillOpacity={0.12} />
    <path
      d="M6 10.5l2.5 2.5 5-5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M8 0l1.5 5.5L15 8l-5.5 1.5L8 16l-1.5-5.5L1 8l5.5-1.5z" />
  </svg>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden
        ${
          "bg-card border border-line shadow-e1"
        }
      `}
      style={{ height: "600px" }}
    >
      {/* Top shimmer bar (popular badge placeholder) */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-28 rounded-full
          ${"bg-surface"}
        `}
      />

      <div className="flex flex-col flex-1 p-7 pt-10 gap-5">
        {/* Plan name */}
        <div
          className={`h-4 w-2/5 rounded-full animate-pulse
            ${"bg-ink-muted/25"}
          `}
        />

        {/* Price block */}
        <div className="flex items-end gap-2">
          <div
            className={`h-12 w-24 rounded-xl animate-pulse
              ${"bg-ink-muted/25"}
            `}
          />
          <div
            className={`h-4 w-16 mb-1 rounded-full animate-pulse
              ${"bg-surface"}
            `}
          />
        </div>

        {/* Divider */}
        <div
          className={`h-px w-full ${"bg-surface"}`}
        />

        {/* Feature rows — 10 rows to fill 600px nicely */}
        <ul className="flex flex-col gap-3 flex-1">
          {[72, 55, 80, 60, 68, 50, 75, 58, 65, 70].map((w, i) => (
            <li key={i} className="flex items-center gap-2.5">
              {/* Check circle */}
              <div
                className={`w-4 h-4 rounded-full shrink-0 animate-pulse
                  ${"bg-ink-muted/25"}
                `}
                style={{ animationDelay: `${i * 60}ms` }}
              />
              {/* Text bar */}
              <div
                className={`h-3 rounded-full animate-pulse
                  ${"bg-surface"}
                `}
                style={{
                  width: `${w}%`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <div
          className={`h-11 w-full rounded-xl animate-pulse
            ${"bg-ink-muted/25"}
          `}
        />
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  index,
  visible,
  dark,
}: {
  plan: PricingPlan;
  index: number;
  visible: boolean;
  dark: boolean;
}) {
  const isPopular = plan.active_mostpopular;
  const checkColor = isPopular ? "#22d3ee" : dark ? "#22d3ee" : "#0891b2";

  return (
    <div
      className={`relative flex flex-col rounded-2xl h-full transition-all duration-200
        ${
          isPopular
            ? dark
              ? "bg-gradient-to-b from-[#0a2540] to-[#0f1e35] border-2 border-accent/60 shadow-[0_0_40px_rgba(34,211,238,0.12)]"
              : "bg-white border-2 border-accent-line shadow-[0_8px_40px_rgba(8,145,178,0.18)]"
            : "bg-card border border-line hover:border-accent-line hover:bg-card-hover"
        }
      `}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? isPopular
            ? "translateY(-8px)"
            : "translateY(0)"
          : "translateY(20px)",
        transition: `opacity 0.55s ease ${index * 100}ms, transform 0.55s ease ${index * 100}ms`,
      }}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="inline-flex items-center gap-1.5 bg-accent-solid text-ink-contrast text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            <SparkleIcon />
            Most Popular
          </div>
        </div>
      )}

      {/* ── inner layout: flex-col, full height ── */}
      <div className="flex flex-col h-full p-7 pt-8">
        {/* ── TOP: name + price + divider (fixed, no grow) ── */}
        <div className="shrink-0">
          <p
            className={`text-[15px] font-bold mb-3 ${"text-ink"}`}
          >
            {plan.price_heading}
          </p>

          <div className="flex items-end gap-1 mb-6">
            <span className="text-5xl font-extrabold text-accent leading-none tracking-tight">
             ${plan.price_amount}
           
            </span>

            <span
              className={`text-[13px] mb-1 ${
                "text-ink-muted"
              }`}
            >
              /package
            </span>
          </div>

          <div
            className={`h-px w-full mb-5 ${"bg-surface"}`}
          />
        </div>

        {/* ── MIDDLE: features — flex-1 grows to fill remaining space ── */}
        <ul className="flex flex-col gap-2.5 flex-1 overflow-hidden">
          {plan.features.map((feature, fi) => (
            <li key={fi} className="flex items-start gap-2.5">
              <CheckIcon color={checkColor} />
              <span
                className={`text-[13px] leading-snug ${"text-ink-soft"}`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* ── BOTTOM: CTA always pinned to bottom ── */}
        <div className="shrink-0 mt-8">
          <Link
            href={plan.contact}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-3 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 text-center block
              ${
                isPopular
                  ? "bg-accent-solid hover:bg-accent-strong text-ink-contrast shadow-md hover:shadow-lg hover:shadow-accent/30"
                  : "border border-line hover:border-accent-line text-ink hover:bg-card-hover"
              }
            `}
          >
            Contact Now
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ dark, onRetry }: { dark: boolean; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          dark ? "bg-red-500/10" : "bg-red-50"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-8 h-8 text-red-400"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>
      <p className={`text-[15px] font-medium ${"text-ink-soft"}`}>
        Failed to load pricing plans
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2 rounded-xl bg-accent-solid hover:bg-accent-strong text-ink-contrast text-[13px] font-bold transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// ─── Main Component ───────────────────────────────────────────────────────────
export default function Pricing() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [isMd, setIsMd] = useState(false);

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(API_BASE, { cache: "no-store" });
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data);
      } else {
        throw new Error("Invalid response shape");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const t = {
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    subheading: "text-ink-soft",
    paginationActive: dark ? "#22d3ee" : "#0891b2",
  };

  // ── key logic: desktop এ ৩টার বেশি হলে swiper ──
  const useDesktopSwiper = isMd && plans.length > 3;
  const useMobileSwiper = !isMd;
  const useSwiper = useDesktopSwiper || useMobileSwiper;

  const popularIndex = plans.findIndex((p) => p.active_mostpopular);
  const initialSlide = popularIndex >= 0 ? popularIndex : 0;

  const swiperStyle = `
   .pricing-swiper .swiper-wrapper {
    align-items: stretch;
  }
  .pricing-swiper .swiper-slide {
    height: auto;
  }
  .pricing-swiper .swiper-pagination-bullet {
    background: ${dark ? "#1a3050" : "#cbd5e1"};
    opacity: 1;
    width: 8px;
    height: 8px;
  }
  .pricing-swiper .swiper-pagination-bullet-active {
    background: ${t.paginationActive};
    width: 24px;
    border-radius: 4px;
  }
  .pricing-swiper .swiper-pagination { bottom: 0; }
  `;

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="w-full px-6 md:px-10 pb-24 md:pb-32"
    >
      {/* ── Eyebrow + Headline ── */}
      <div
        className={`flex flex-col items-center text-center mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${t.eyebrowBdr} ${t.eyebrowBg} ${t.eyebrowTxt} text-[11px] font-bold tracking-[0.14em] uppercase mb-6`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${t.eyebrowDot} shrink-0`}
          />
          Pricing Plans
        </div>

        <h2
          className={`text-4xl md:text-5xl font-extrabold ${t.heading} leading-tight mb-4 tracking-tight max-w-2xl`}
        >
          Straightforward Pricing.{" "}
          <span className="text-accent">Solid Engineering.</span>
        </h2>
        <p
          className={`${t.subheading} text-[15px] max-w-[500px] leading-relaxed`}
        >
          Whether it{"'"}s a single feature or a full product build, there{"'"}s
          a plan that fits — no hidden fees, no lock-in.
        </p>
      </div>

      {/* ── Error State ── */}
      {error && <ErrorState dark={dark} onRetry={fetchPlans} />}

      {/* ── Loading Skeleton ── */}
      {loading && !error && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-start pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Loaded Content ── */}
      {!loading && !error && plans.length > 0 && (
        <>
          {/* ── SWIPER: mobile সবসময় | desktop শুধু ৩+ হলে ── */}
          {useSwiper ? (
            <div
              className={`transition-all duration-700 delay-200 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <style>{swiperStyle}</style>
              <Swiper
                className="pricing-swiper !pb-10 !pt-6"
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                // desktop > 3: একসাথে ৩টা দেখাবে | mobile: ১টা
                slidesPerView={useDesktopSwiper ? 3 : 1}
                centeredSlides={!useDesktopSwiper}
                initialSlide={initialSlide}
                autoplay={{
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{ clickable: true }}
                loop
              >
                {plans.map((plan, i) => (
                  <SwiperSlide
                    key={plan._id}
                    style={{ height: "auto", alignSelf: "stretch" }}
                  >
                    <div className="pt-6 pb-2 h-full flex flex-col">
                      <PlanCard
                        plan={plan}
                        index={i}
                        visible={visible}
                        dark={dark}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            /* ── GRID: desktop এবং ৩টা বা কম ── */
            <div
              className="max-w-6xl mx-auto grid grid-cols-3 gap-5 pt-6"
              style={{ alignItems: "stretch" }}
            >
              {plans.map((plan, i) => (
                <div key={plan._id} className="flex flex-col">
                  <PlanCard
                    plan={plan}
                    index={i}
                    visible={visible}
                    dark={dark}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}