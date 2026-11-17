"use client";

import React, { useEffect, useRef, useState } from "react";

const VIDEO_ID = "K2VzKntMOCQ";

export default function VideoIntro() {

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const t = {
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    subText: "text-ink-soft",
    cardBg: "bg-card",
    cardBdr: "border-line",
    overlayBg: "bg-page/80",
  };

  const thumbUrl = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

  return (
    <section
      ref={sectionRef}
      id="video-intro"
      className="w-full px-6 md:px-10 pb-24 md:pb-32"
    >
      {/* Eyebrow + Headline */}
      <div
        className={`flex flex-col items-center text-center mb-14 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${t.eyebrowBdr} ${t.eyebrowBg} ${t.eyebrowTxt} text-[11px] font-bold tracking-[0.14em] uppercase mb-6`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${t.eyebrowDot} shrink-0`}
          />
          Watch Introduction
        </div>

        <h2
          className={`text-4xl md:text-5xl font-extrabold ${t.heading} leading-tight mb-4 tracking-tight max-w-2xl`}
        >
          See how I help brands{" "}
          <span className="text-accent">scale with precision</span>
        </h2>

        <p className={`text-[15px] ${t.subText} max-w-xl leading-relaxed`}>
          A quick walkthrough of my process, tools, and the results I{"'"}ve
          driven for e-commerce brands.
        </p>
      </div>

      {/* Video Thumbnail Card */}
      <div
        className="max-w-4xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease 150ms, transform 0.6s ease 150ms",
        }}
      >
        <div
          className={`relative group rounded-2xl overflow-hidden border ${t.cardBdr} ${t.cardBg} cursor-pointer shadow-xl`}
          onClick={() => setModalOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Play introduction video"
          onKeyDown={(e) => e.key === "Enter" && setModalOpen(true)}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={thumbUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Outer pulse ring */}
                <span className="absolute w-24 h-24 rounded-full bg-accent/20 animate-ping" />
                {/* Button circle */}
                <div className="relative w-20 h-20 rounded-full bg-accent-solid shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent-strong">
                  {/* Play triangle */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-8 h-8 ml-1"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom label */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4 text-accent"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-white text-[12px] font-medium tracking-wide">
                ~3 min watch
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative z-10 w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-12 right-0 flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
              aria-label="Close video"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Press Esc to close
            </button>

            {/* iFrame wrapper */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.2)] border border-accent/20">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?si=5Rakm_CgKv4Flakp&autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
