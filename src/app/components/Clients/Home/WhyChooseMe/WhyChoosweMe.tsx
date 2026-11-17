"use client";

import React, { useEffect, useRef, useState } from "react";
import Tilt3D from "@/app/components/ui/Tilt3D";

const reasons = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Clean & Scalable Code",
    desc: "Writing maintainable, well-structured code following industry best practices and design patterns.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Full-Stack Expertise",
    desc: "End-to-end development — from responsive frontends to robust backend APIs and databases.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Performance Optimization",
    desc: "Fast-loading, efficient applications built with best practices for speed and scalability.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    title: "Modern Tech Stack",
    desc: "Staying updated with the latest frameworks and tools to build future-proof applications.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.71 0 3.31.48 4.67 1.31" />
        <path d="M21 3v6h-6" />
      </svg>
    ),
    title: "Problem-Solving Mindset",
    desc: "Breaking down complex requirements into simple, effective, and testable solutions.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-6 h-6"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Fast Communication",
    desc: "Clear updates, quick responses, and real accountability throughout every project.",
  },
];

export default function WhyChooseMe() {

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  const t = {
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    cardHover: "hover:bg-card-hover hover:border-accent-line",
    iconBg: "bg-accent-soft",
    iconColor: "text-accent",
    cardTitle: "text-ink",
    cardDesc: "text-ink-soft",
  };

  return (
    <section
      ref={sectionRef}
      id="why-choose-me"
      className="w-full px-6 md:px-10 pt-24 md:pt-32"
    >
      {/* Eyebrow + Headline */}
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
          Why Choose Me
        </div>

        <h2
          className={`text-4xl md:text-5xl font-extrabold ${t.heading} leading-tight mb-5 tracking-tight max-w-2xl`}
        >
          Built like an engineer.{" "}
          <span className="text-accent">Delivered like a partner.</span>
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reasons.map((item, i) => (
          // The reveal transition lives on this wrapper so it never fights the
          // pointer-driven transform Tilt3D writes on the card itself.
          <div
            key={i}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`,
            }}
          >
            <Tilt3D
              max={7}
              lift={12}
              className={`surface-3d h-full rounded-2xl p-6 flex gap-4 items-start ${t.cardHover}`}
            >
              {/* Icon box — pushed forward so it separates from the card face */}
              <div
                className={`depth-2 w-12 h-12 rounded-xl ${t.iconBg} flex items-center justify-center shrink-0 ${t.iconColor}`}
              >
                {item.icon}
              </div>

              {/* Text */}
              <div className="depth-1">
                <p
                  className={`font-bold text-[15px] ${t.cardTitle} mb-1.5 leading-snug`}
                >
                  {item.title}
                </p>
                <p className={`text-[13px] ${t.cardDesc} leading-relaxed`}>
                  {item.desc}
                </p>
              </div>
            </Tilt3D>
          </div>
        ))}
      </div>
    </section>
  );
}
