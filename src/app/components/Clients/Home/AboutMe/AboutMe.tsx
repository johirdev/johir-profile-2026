"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Tilt3D from "@/app/components/ui/Tilt3D";
import daisen from "@/assets/company/daisen.webp"
import mocdit from "@/assets/company/mocdt.webp"
import coders24 from "@/assets/company/coders24.png"
import Image from "next/image";

const skills = [
  { label: "React.js / Next.js", level: 95 },
  { label: "TypeScript / JavaScript", level: 92 },
  { label: "Redux / Zustand / TanStack Query", level: 88 },
  { label: "Node.js / Express.js", level: 85 },
  { label: "MongoDB / PostgreSQL / MySQL", level: 82 },
  { label: "Go (Golang) / REST APIs", level: 72 },
  { label: "DevOps", level: 40 },
];


const experience = [
  // {
  //   company: "Coders24",
  //   logo : coders24,
  //   role: "Software Engineer",
  //   url: "https://www.coders24.com",
  //   period: "May 2026 – Present · Onsite",
  //   points: [
  //     "Developing scalable full-stack web applications using Next.js, React.js, TypeScript, Node.js, Go (Gin), MongoDB, and MySQL.",
  //     "Designing and building RESTful APIs, integrating third-party services, and optimizing application performance for production environments.",
  //     "Collaborating with designers, product managers, and developers in an Agile/Scrum workflow, participating in sprint planning, code reviews, and feature delivery.",
  //     "Implementing secure authentication, database design, reusable components, and responsive user interfaces to deliver high-quality software solutions.",
  //   ],
  //   projects: [
  //     {
  //       name: "hypertouchofficial.com",
  //       url: "https://hypertouchofficial.com",
  //     },
  //     {
  //       name: "wristick.com",
  //       url: "https://wristick.com",
  //     },
  //     {
  //       name: "taspi.com",
  //       url: "https://taspi.vercel.app/",
  //     },
  //   ],
  // },
  {
    company: "Daisen Technology Ltd -(日本企業)",
    logo: daisen,
    role: "Frontend Software Engineer",
    url: "https://www.daisentech.com",
    period: "Oct 2024 – Mar 2026 · Onsite",
    points: [
      "Led front-end development of scalable customer-facing web apps using React.js, Next.js, TypeScript, Redux, and Node.js/Go (Gin).",
      "Collaborated with cross-functional teams in an Agile/Scrum environment — sprint planning, daily stand-ups, and code reviews.",
      "Integrated REST APIs and provided production support to deliver responsive, high-performance solutions.",
    ],
    projects: [
      { name: "jabeda.net", url: "https://jabeda.net" },
      { name: "coreoku.com", url: "https://coreoku.com" },
      { name: "hypertouchofficial.com", url: "https://hypertouchofficial.com" },
    ],
  },
  {
    company: "MocDT",
    logo: mocdit,
    role: "Junior Web Developer",
    url: "https://www.mocdt.com",
    period: "Mar 2023 – Sep 2024 · Remote",
    points: [
      "Designed responsive, user-friendly web applications using React.js, Next.js, and TypeScript.",
      "Integrated REST APIs and collaborated closely with cross-functional teams to ship features.",
    ],
    projects: [
      { name: "mocdt.com", url: "https://www.mocdt.com" },
      { name: "workspace", url: "https://www.mocdt.com/workspace" },
      { name: "mail", url: "https://www.mocdt.com/mail" },
      { name: "calendar", url: "https://www.mocdt.com/calendar" },
    ],
  },
];

const platforms = [
  "React.js",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Express.js",
  "Go (Golang)",
  "Prisma",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Nginx",
  "GitHub Actions",
  "Figma",
];

export default function AboutMe() {

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [skillsVisible, setSkillsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setTimeout(() => setSkillsVisible(true), 500);
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Token helpers ── */
  const t = {
    /* text */
    heading: "text-ink",
    body: "text-ink-soft",
    strong: "text-ink",
    labelMuted: "text-ink-muted",
    /* eyebrow */
    eyebrowBg: "bg-accent-soft",
    eyebrowBdr: "border-accent-line",
    eyebrowTxt: "text-accent",
    eyebrowDot: "bg-accent-solid",
    /* card */
    cardHover: "hover:bg-card-hover hover:border-accent-line",
    /* timeline period pill */
    pillBg: "bg-surface",
    pillBdr: "border-line",
    pillTxt: "text-ink-muted",
    /* skill track */
    trackBg: "bg-surface",
    /* platform tag */
    tagBg: "bg-accent-soft",
    tagBdr: "border-accent-line",
    tagHover: "hover:bg-accent-soft hover:border-accent-line",
    /* vertical timeline line */
    vLine: "bg-ink-muted/20",
    /* dot ring */
    dotRing: "border-page",
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`max-width mx-auto w-full px-6 md:px-10 py-24 md:py-32 transition-colors duration-300`}
    >
      {/* ── Eyebrow + Headline ── */}
      <div
        className={`max-w-2xl mb-16 transition-all mx-auto flex flex-col items-center text-center duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${t.eyebrowBdr} ${t.eyebrowBg} ${t.eyebrowTxt} text-[11px] font-bold tracking-[0.14em] uppercase mb-6`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${t.eyebrowDot} shrink-0`}
          />
          About Me
        </div>

        <h2
          className={`text-4xl md:text-5xl text-center font-extrabold ${t.heading} leading-tight mb-5 tracking-tight`}
        >
          The engineer behind{" "}
          <span className="text-accent">scalable, high-performance apps</span>
        </h2>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14">
        {/* Left: bio + skills + platforms */}
        <div
          className={`flex flex-col gap-9 transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <p className={`${t.body} text-lg leading-relaxed mt-5`}>
            I&apos;m{" "}
            <strong className={`${t.strong} font-semibold`}>
              Johirul Islam Rasel
            </strong>
            , a Software Engineer with 4+ years of experience building modern,
            scalable, and high-performance web applications. I&apos;m passionate
            about crafting exceptional user experiences, solving complex
            problems, and continuously growing toward becoming a Full-Stack
            Software Engineer — contributing with honesty, dedication, and hard
            work.
          </p>

          {/* Skill bars */}
          <div>
            <p
              className={`text-[11px] font-bold tracking-[0.12em] uppercase ${t.labelMuted} mb-4`}
            >
              Core Skills
            </p>
            <div className="flex flex-col gap-3.5">
              {skills.map((skill, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[13px] font-medium ${t.body}`}>
                      {skill.label}
                    </span>
                    <span className="tabular text-[12px] font-bold text-accent">
                      {skill.level}%
                    </span>
                  </div>
                  <div
                    className={`h-1 rounded-full ${t.trackBg} overflow-hidden`}
                  >
                    <div
                      className="h-full rounded-full bg-accent-solid transition-all duration-1000 ease-out"
                      style={{
                        width: skillsVisible ? `${skill.level}%` : "0%",
                        transitionDelay: `${i * 80}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform tags */}
          <div>
            <p
              className={`text-[11px] font-bold tracking-[0.12em] uppercase ${t.labelMuted} mb-4`}
            >
              Platforms & Tools
            </p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold text-accent ${t.tagBg} border ${t.tagBdr} ${t.tagHover} transition-all duration-150 cursor-default`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Experience timeline */}
        <div
          className={`transition-all ps-2  md:ps-3  md:max-h-[780px] overflow-y-auto duration-700 delay-150 ${
            visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
        >
          <p
            className={`text-[11px] font-bold tracking-[0.12em] uppercase ${t.labelMuted} mb-5`}
          >
            Experience
          </p>

          <div className="relative pl-6">
            {/* vertical line */}
            <div
              className={`absolute left-[5px] top-1.5 bottom-0 w-px ${t.vLine}`}
            />

            {experience.map((exp, i) => (
              <div key={i} className="relative mb-8 last:mb-0">
                {/* dot */}
                <div
                  className={`absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-accent-solid border-2 ${t.dotRing} ring-2 ring-accent/60`}
                />

                <Tilt3D
                  max={5}
                  lift={10}
                  className={`surface-3d rounded-xl p-5 ${t.cardHover}`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={exp.logo}
                          alt={exp.company}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <Link
                          href={exp?.url}
                          target="_blank"
                          className={`${t.heading} font-bold text-[15px] mb-0.5`}
                        >
                          {exp.company}
                        </Link>
                      </div>
                      <p className="text-accent text-[13px] font-medium">
                        {exp.role}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${t.pillTxt} ${t.pillBg} border ${t.pillBdr} px-3 py-1 rounded-full shrink-0`}
                    >
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {exp.points.map((pt, j) => (
                      <li
                        key={j}
                        className={`flex gap-2.5 text-[13.5px] ${t.body} leading-relaxed`}
                      >
                        <span className="text-accent mt-[3px] shrink-0 text-[10px]">
                          ▸
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>

                  {exp.projects && exp.projects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {exp.projects.map((proj) => (
                        <a
                          key={proj.url}
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-accent ${t.tagBg} border ${t.tagBdr} ${t.tagHover} transition-all duration-150`}
                        >
                          {proj.name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 17L17 7" />
                            <path d="M7 7h10v10" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  )}
                </Tilt3D>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
