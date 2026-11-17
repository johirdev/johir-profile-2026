"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Me", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Qualifications", href: "/qualifications" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const services = [
  { label: "Frontend Development", href: "#services" },
  { label: "Full-Stack Web Apps", href: "#services" },
  { label: "React & Next.js Development", href: "#services" },
  { label: "API Integration & Backend", href: "#services" },
  { label: "UI/UX Implementation", href: "#services" },
  { label: "Performance Optimization", href: "#services" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/rasel2023boss",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mr.raselkhan100/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-4 h-4"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/johirul-islam-rasel/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/johirdev",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.27 7.77 10.77.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.79.55 4.5-1.5 7.76-5.75 7.76-10.77C23.25 5.48 18.27.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/8801824842336",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L0 24l6.335-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.371l-.36-.214-3.732.979.997-3.645-.234-.374A9.818 9.818 0 1 1 12 21.818z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const t = {
    /* backgrounds */
    bg: "bg-card",
    stripBg: "bg-page",
    bottomBg: "bg-surface",

    /* borders */
    topBdr: "border-line",
    divider: "border-line",

    /* text */
    logo: "text-ink",
    heading: "text-ink",
    tagline: "text-ink-soft",
    link: "text-ink-soft hover:text-accent",
    copyTxt: "text-ink-muted",

    /* CTA strip */
    ctaHeading: "text-ink",
    ctaDesc: "text-ink-soft",

    /* social icon buttons */
    socialBg: "bg-card border-line hover:bg-accent-soft hover:border-accent-line",
    socialIcon: "text-ink-soft group-hover:text-accent",

    /* availability badge */
    badge: "bg-accent-soft text-accent border-accent-line",

    /* dot */
    dot: "bg-ink-muted/35",
  };

  return (
    <footer className={`w-full ${t.bg} transition-colors duration-300`}>
      {/* ── Top CTA strip ── */}
      <div
        className={`border-b ${t.topBdr} ${t.stripBg} px-6 md:px-10 py-10 transition-colors duration-300`}
      ></div>

      {/* ── Main footer grid ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1 — Brand */}
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className={`font-extrabold text-lg tracking-tight ${t.logo}`}
          >
            <Image
              width={60}
              height={40}
              src={"/Johirul-islam-rasel.png"}
              alt="Md. Johirul Islam Rasel"
            />
          </Link>

          <p
            className={`text-[13px] leading-relaxed ${t.tagline} max-w-[220px]`}
          >
            Full-Stack Software Engineer building modern, scalable, and
            high-performance web applications with React & Next.js.
          </p>

          {/* Contact info */}
          <div className="flex flex-col gap-2">
            <a
              href="mailto:johirulislam574206@gmail.com"
              className={`text-[12px] ${t.link} transition-colors flex items-center gap-2`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-3.5 h-3.5 shrink-0"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              johirulislam574206@gmail.com
            </a>
            <a
              href="tel:+8801824842336"
              className={`text-[12px] ${t.link} transition-colors flex items-center gap-2`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-3.5 h-3.5 shrink-0"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 5.52 5.52l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
              </svg>
              +880 1824842336
            </a>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2 flex-wrap">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className={`group w-8 h-8 rounded-lg border ${t.socialBg} flex items-center justify-center transition-all duration-200`}
              >
                <span
                  className={`${t.socialIcon} transition-colors duration-200`}
                >
                  {s.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div className="flex flex-col gap-4">
          <p
            className={`text-[11px] font-bold tracking-[0.13em] uppercase ${t.heading}`}
          >
            Navigation
          </p>
          <ul className="flex flex-col gap-2.5">
            {navLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className={`text-[13px] ${t.link} transition-colors duration-150 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-accent/50 shrink-0" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Services */}
        <div className="flex flex-col gap-4">
          <p
            className={`text-[11px] font-bold tracking-[0.13em] uppercase ${t.heading}`}
          >
            Services
          </p>
          <ul className="flex flex-col gap-2.5">
            {services.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className={`text-[13px] ${t.link} transition-colors duration-150 flex items-center gap-1.5`}
                >
                  <span className="w-1 h-1 rounded-full bg-accent/50 shrink-0" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Availability */}
        <div className="flex flex-col gap-4">
          <p
            className={`text-[11px] font-bold tracking-[0.13em] uppercase ${t.heading}`}
          >
            Availability
          </p>
          <div className="flex flex-col gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold ${t.badge} w-fit`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              Available for new projects
            </div>

            <p className={`text-[13px] ${t.tagline} leading-relaxed`}>
              Currently accepting freelance and full-time opportunities in
              frontend and full-stack development.
            </p>

            <div className="flex flex-col gap-2 mt-1">
              {[
                "React & Next.js Apps",
                "TypeScript Projects",
                "Freelance Contracts",
                "Full-Time Roles",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="w-3.5 h-3.5 text-accent shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className={`text-[12px] ${t.tagline}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className={`border-t ${t.divider} ${t.bottomBg} px-6 md:px-10 py-5 transition-colors duration-300`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className={`text-[12px] ${t.copyTxt}`}>
            © {year} Md. Johirul Islam Rasel. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}
