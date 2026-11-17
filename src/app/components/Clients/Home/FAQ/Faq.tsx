"use client";

import React, { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "What services do you offer?",
    a: "I build end-to-end web applications using React, Next.js, and TypeScript — from responsive UI development and API integration to full-stack features with Node.js, Express, and databases like MongoDB and PostgreSQL. I also handle performance optimization, bug fixes, and deployment on Vercel.",
  },
  {
    q: "What is your tech stack?",
    a: "React, Next.js, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query, Redux, Node.js, Express.js, Go, Prisma, MongoDB, PostgreSQL, MySQL, Redis, Docker, Nginx, and GitHub Actions for CI/CD.",
  },
  {
    q: "How much do you charge?",
    a: "Pricing depends on project scope and complexity. Simple landing pages and single-page apps are quoted as a fixed package, while larger full-stack builds or ongoing work are quoted per milestone or as a monthly retainer. Message me your requirements for an exact quote.",
  },
  {
    q: "How long does a project take?",
    a: "A typical landing page or portfolio site takes 3–7 days. Full-stack apps with authentication, dashboards, or admin panels usually take 2–4 weeks depending on features. I'll give you a clear timeline after understanding your requirements.",
  },
  {
    q: "Do you work with startups and small businesses?",
    a: "Yes — most of my projects have been for startups, agencies, and small businesses that need a professional web presence or a working product without enterprise-level overhead. I scale the solution to fit your budget and timeline.",
  },
  {
    q: "Will the code be clean and maintainable?",
    a: "Always. I follow a modular file structure, strong TypeScript typing, and consistent component patterns, so your codebase stays easy to extend and hand off to other developers if needed.",
  },
  {
    q: "Do I own the code and repository?",
    a: "100% yes. All source code, repositories, and deployment access remain fully yours. I work inside your GitHub organization and hosting accounts — you retain complete ownership at every stage.",
  },
  {
    q: "Can you work with an existing codebase?",
    a: "Yes. I regularly join ongoing projects to fix bugs, migrate legacy code (like Express to Next.js API routes), add new features, or improve performance in an existing React/Next.js application.",
  },
  {
    q: "Do you handle both frontend and backend?",
    a: "Yes, I work as a full-stack engineer. On the frontend I build responsive, animated interfaces with React/Next.js and Tailwind; on the backend I build REST APIs, authentication, and database logic with Node.js, Express, or Go.",
  },
  {
    q: "How do I get started?",
    a: "Click 'Hire Me' or reach out through the contact section with your project details. I'll respond within the same day, discuss your requirements, and share a timeline and quote so we can get started quickly.",
  },
];

export default function FAQ() {

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(2);

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

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const t = {
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    heading: "text-ink",
    cardBg: "bg-card",
    cardBdr: "border-line",
    cardBdrOpen: "border-accent-line",
    qText: "text-ink",
    aText: "text-ink-soft",
    iconBg: "bg-surface",
    iconBgOpen: "bg-accent-soft",
    iconColor: "text-ink-muted",
    iconColorOpen: "text-accent",
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="w-full px-6 md:px-10 pb-24 md:pb-32"
    >
      {/* Eyebrow + Headline */}
      <div
        className={`flex flex-col items-center text-center mb-12 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${t.eyebrowBdr} ${t.eyebrowBg} ${t.eyebrowTxt} text-[11px] font-bold tracking-[0.14em] uppercase mb-6`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${t.eyebrowDot} shrink-0`}
          />
          FAQ
        </div>

        <h2
          className={`text-4xl md:text-5xl font-extrabold ${t.heading} leading-tight tracking-tight max-w-2xl`}
        >
          Frequently asked <span className="text-accent">questions</span>
        </h2>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`border rounded-2xl overflow-hidden transition-all duration-200
                ${isOpen ? t.cardBdrOpen : t.cardBdr}
                ${t.cardBg}
              `}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(14px)",
                transition: `opacity 0.5s ease ${i * 45}ms, transform 0.5s ease ${i * 45}ms`,
              }}
            >
              {/* Question row */}
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span
                  className={`text-[16px] font-semibold ${t.qText} leading-snug`}
                >
                  {faq.q}
                </span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200
                    ${isOpen ? t.iconBgOpen : t.iconBg}
                    ${isOpen ? t.iconColorOpen : t.iconColor}
                  `}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    <path
                      d="M5 7.5l5 5 5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {/* Answer */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`px-5 pb-5 text-[14px] leading-relaxed ${t.aText}`}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
