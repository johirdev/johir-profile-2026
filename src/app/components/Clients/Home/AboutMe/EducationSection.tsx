/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useThemeStore } from "@/app/lib/store";
import React, { useEffect, useRef, useState } from "react";
import nus from "@/assets/education/nus.webp";
import mpi from "@/assets/education/mpi.webp";
import goradoba from "@/assets/education/goraboda.webp";
import Image from "next/image";

/**
 * ── Data ──
 * `initials` holds the imported logo image (StaticImageData). If you ever
 * need a raw public-path fallback instead, point `logo` at it — the
 * component tries the imported image first and falls back to `logo`.
 */
const educationData = [
  {
    level: "B.Sc. in Engineering",
    institution: "Northern University Bangladesh (NUB)",
    group: "Computer Science & Engineering",
    result: "Currently Studying",
    resultLabel: "Status",
    year: "2026 – 2030",
    logo: "/logos/nub.png",
    initials: nus,
    badge: "In Progress",
    live: true,
    accent: "cyan" as const,
  },
  {
    level: "Diploma in Engineering",
    institution: "Mymensingh Polytechnic Institute",
    group: "Computer Science & Technology",
    result: "3.48 / 4.00",
    resultLabel: "GPA",
    year: "2021 – 2025",
    logo: "/logos/mpi.png",
    initials: mpi,
    badge: "Completed",
    live: false,
    accent: "violet" as const,
  },
  {
    level: "Secondary School Certificate",
    institution: "Goradoba Abdul Hamid High School",
    group: "SSC · Technical Board",
    result: "A+ / 5.00",
    resultLabel: "GPA",
    year: "2017 – 2019",
    logo: "/logos/school.png",
    initials: goradoba,
    badge: "Completed",
    live: false,
    accent: "amber" as const,
  },
];

type Accent = "cyan" | "violet" | "amber";

function useAccentTokens(accent: Accent, dark: boolean) {
  const map = {
    cyan: {
      glow: dark
        ? "hover:shadow-[0_8px_30px_-8px_rgba(34,211,238,0.35)]"
        : "hover:shadow-[0_8px_24px_-8px_rgba(34,211,238,0.25)]",
      text: "text-accent",
      dot: "bg-accent-solid",
      trace: dark ? "#22d3ee" : "#06b6d4",
      pin: "bg-accent-solid",
      badgeBg: "bg-accent-soft",
      badgeBdr: "border-accent-line",
      badgeTxt: "text-accent",
      pillBdr: "border-accent-line",
      hoverBdr: "hover:border-accent-line",
    },
    violet: {
      glow: dark
        ? "hover:shadow-[0_8px_30px_-8px_rgba(167,139,250,0.35)]"
        : "hover:shadow-[0_8px_24px_-8px_rgba(167,139,250,0.25)]",
      text: dark ? "text-violet-300" : "text-violet-600",
      dot: "bg-violet-400",
      trace: dark ? "#a78bfa" : "#7c3aed",
      pin: dark ? "bg-violet-400/70" : "bg-violet-400",
      badgeBg: dark ? "bg-violet-500/10" : "bg-violet-50",
      badgeBdr: dark ? "border-violet-500/25" : "border-violet-200",
      badgeTxt: dark ? "text-violet-300" : "text-violet-600",
      pillBdr: dark ? "border-violet-500/20" : "border-violet-200",
      hoverBdr: dark ? "hover:border-violet-500/40" : "hover:border-violet-300",
    },
    amber: {
      glow: dark
        ? "hover:shadow-[0_8px_30px_-8px_rgba(251,191,36,0.35)]"
        : "hover:shadow-[0_8px_24px_-8px_rgba(251,191,36,0.25)]",
      text: dark ? "text-amber-300" : "text-amber-700",
      dot: "bg-amber-400",
      trace: dark ? "#fbbf24" : "#b45309",
      pin: dark ? "bg-amber-400/70" : "bg-amber-400",
      badgeBg: dark ? "bg-amber-500/10" : "bg-amber-50",
      badgeBdr: dark ? "border-amber-500/25" : "border-amber-200",
      badgeTxt: dark ? "text-amber-300" : "text-amber-700",
      pillBdr: dark ? "border-amber-500/20" : "border-amber-200",
      hoverBdr: dark ? "hover:border-amber-500/40" : "hover:border-amber-300",
    },
  };
  return map[accent];
}

/** Logo chip styled like a component on a circuit board: a couple of
 *  short "pins" project from each side. Falls back to a plain <img>
 *  from `fallback` if the imported image errors out. */
function InstituteLogo({
  src,
  fallback,
  pin,
}: {
  src: any;
  fallback: string;
  pin: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative shrink-0">
      <span
        className={`hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-[2px] rounded-full ${pin}`}
      />
      <span
        className={`hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-[2px] rounded-full ${pin}`}
      />
      <div className="w-16 h-16 rounded-2xl bg-white ring-1 ring-black/5 flex items-center justify-center overflow-hidden p-2">
        {failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fallback} alt="" className="w-full h-full object-contain" />
        ) : (
          <Image
            src={src}
            alt=""
            width={64}
            height={64}
            onError={() => setFailed(true)}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
}

export default function EducationSection() {
  const { theme } = useThemeStore();
  const dark = theme === "dark";

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const cardBg = "bg-card";
  const cardBdr = "border-line";
  const heading = "text-ink";
  const body = "text-ink-soft";
  const labelMuted = "text-ink-muted";
  const traceLine = dark ? "#1c2c45" : "#e2e8f0";

  const eyebrowBg = "bg-accent-soft";
  const eyebrowBdr = "border-accent-line";
  const eyebrowTxt = "text-accent";

  const stats = [
    { label: "Institutions", value: String(educationData.length) },
    { label: "Journey started", value: "2017" },
    { label: "Current focus", value: "CSE" },
  ];

  return (
    <div ref={ref} className="mt-20">
      {/* keyframes for the traveling signal on the trace line */}
      <style jsx>{`
        @keyframes signal-travel {
          0% {
            top: 0%;
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .signal-pulse {
          animation: signal-travel 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* ── Eyebrow + Headline ── */}
      <div
        className={`max-w-2xl mb-10 transition-all mx-auto flex flex-col items-center text-center duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${eyebrowBdr} ${eyebrowBg} ${eyebrowTxt} text-[11px] font-bold tracking-[0.14em] uppercase mb-6`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
          Education
        </div>

        <h2
          className={`text-4xl md:text-5xl text-center font-extrabold ${heading} leading-tight mb-5 tracking-tight`}
        >
          Academic <span className="text-accent">Qualifications</span>
        </h2>

        {/* stats row */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {stats.map((s, idx) => (
            <React.Fragment key={s.label}>
              <div
                className={`flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-full border ${cardBdr} ${cardBg}`}
              >
                <span className={`text-sm font-extrabold ${heading}`}>
                  {s.value}
                </span>
                <span
                  className={`text-[10.5px] font-semibold uppercase tracking-wide ${labelMuted}`}
                >
                  {s.label}
                </span>
              </div>
              {idx < stats.length - 1 && (
                <span
                  className={`hidden sm:block w-1 h-1 rounded-full ${
                    "bg-ink-muted/35"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Circuit-trace timeline ── */}
      <div className="relative max-w-3xl mx-auto mt-14">
        {/* the vertical trace, drawn once behind every node, with a
            traveling "signal" pulse — the one animated flourish on
            this page, tying back to the electrical/CS subject matter */}
        <div
          className="absolute left-7 top-7 bottom-7 w-px hidden sm:block overflow-hidden"
          style={{ backgroundColor: traceLine }}
        >
          <span
            className="signal-pulse absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: dark ? "#67e8f9" : "#06b6d4",
              boxShadow: dark
                ? "0 0 10px 2px rgba(103,232,249,0.8)"
                : "0 0 8px 2px rgba(6,182,212,0.6)",
            }}
          />
        </div>

        <div className="flex flex-col gap-5">
          {educationData.map((edu, i) => {
            const a = useAccentTokens(edu.accent, dark);
            const railBorder =
              edu.accent === "cyan"
                ? "border-l-accent-solid"
                : edu.accent === "violet"
                  ? "border-l-violet-400"
                  : "border-l-amber-400";
            return (
              <div
                key={edu.institution}
                className={`relative sm:pl-[4.5rem] transition-all duration-600 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 140 + 150}ms` }}
              >
                {/* node ring sitting on the trace */}
                <span
                  className="hidden sm:flex items-center justify-center absolute left-[22px] top-9 w-4 h-4 rounded-full z-10"
                  style={{
                    backgroundColor: dark ? "#060d1a" : "#f8fafc",
                    border: `2px solid ${a.trace}`,
                  }}
                >
                  <span className={`relative w-2 h-2 rounded-full ${a.dot}`}>
                    {edu.live && (
                      <span
                        className={`absolute inset-0 rounded-full ${a.dot} animate-ping opacity-60`}
                      />
                    )}
                  </span>
                </span>
                {/* short horizontal lead from trace to card */}
                <span
                  className="hidden sm:block absolute left-[30px] top-[38px] h-px w-6"
                  style={{
                    backgroundColor: a.trace,
                    opacity: dark ? 0.5 : 0.6,
                  }}
                />

                <div
                  className={`group relative rounded-2xl border ${cardBdr} ${cardBg} ${a.hoverBdr} ${a.glow} transition-all duration-300 hover:-translate-y-0.5 p-5 sm:p-6 border-l-4 sm:border-l ${railBorder} overflow-hidden`}
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    <InstituteLogo
                      src={edu.initials}
                      fallback={edu.logo}
                      pin={a.pin}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.13em] ${a.text}`}
                        >
                          {edu.level}
                        </p>
                        <span
                          className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${a.badgeBg} ${a.badgeBdr} ${a.badgeTxt} tracking-wide`}
                        >
                          {edu.live && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 align-middle animate-pulse" />
                          )}
                          {edu.badge}
                        </span>
                      </div>

                      <h4
                        className={`${heading} font-bold text-[16px] sm:text-[17px] leading-snug mb-0.5 truncate`}
                        title={edu.institution}
                      >
                        {edu.institution}
                      </h4>
                      <p className={`text-[12.5px] font-medium ${body} mb-3`}>
                        {edu.group}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-lg border ${a.pillBdr} ${a.text}`}
                        >
                          {edu.resultLabel}: {edu.result}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-lg border ${cardBdr} ${labelMuted}`}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M16 2v4M8 2v4M3 10h18"
                              strokeLinecap="round"
                            />
                          </svg>
                          {edu.year}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* quiet corner glow on hover — echoes a circuit pad
                      without adding noise at rest */}
                  <span
                    className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl"
                    style={{ backgroundColor: a.trace, opacity: 0.15 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
