/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import anamulHasan from "@/assets/johir.png";
import "./heroBanner.css";
import { Download, MoveRightIcon } from "lucide-react";
import Tilt3D from "@/app/components/ui/Tilt3D";

/* ─────────────────────────────────────────
   TYPING HOOK
───────────────────────────────────────── */
const TYPED_WORDS = [
  "Software Engineer.",
  "Frontend Engineer.",
  "Backend Engineer.",
  "DevOps Learner.",
  "AI Enthusiast & Tech Enthusiast.",
];

/* ─────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const raf = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
      else setCount(target);
    };
    requestAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

/* ─────────────────────────────────────────
   SKILLS LIST
───────────────────────────────────────── */
const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React.js",
  "Next.js",
  "Go (Golang)",
  "Node.js",
  "Express.js",
  "Prisma",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Tailwind CSS",
  "ShadCN UI",
  "Redux Toolkit",
  "Zustand",
  "TanStack Query",
  "i18next",
  "Socket.io",
  "JWT Auth",
  "REST APIs",
  "Docker",
  "GitHub Actions",
  "CI/CD",
  "Nginx",
  "Firebase",
  "Git",
  "Laravel",
  "Framer Motion",
];
const useTypingEffect = (words: string[]) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const nextText = currentWord.slice(0, text.length + 1);
          setText(nextText);

          if (nextText === currentWord) {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          const nextText = currentWord.slice(0, text.length - 1);
          setText(nextText);

          if (nextText === "") {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 40 : 80,
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return text;
};
/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const HeroBanner = () => {
  const typed = useTypingEffect(TYPED_WORDS);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const yearsCount    = useCountUp(4,   1400, inView);
  const clientsCount  = useCountUp(20,  1600, inView);
  const successCount  = useCountUp(985, 1900, inView);
  const projectsCount = useCountUp(20,  1500, inView);
  const myAge = useCountUp(24,  1200, inView);

  return (
    <>
      <section id="home" className="hn-hero" ref={sectionRef} aria-label="Hero">
        {/* Background decorations */}
        <div className="hn-hero__grid" aria-hidden="true" />
        <div className="hn-hero__blob hn-hero__blob--1" aria-hidden="true" />
        <div className="hn-hero__blob hn-hero__blob--2" aria-hidden="true" />

        <div className="hn-hero__inner">
          {/* ══ LEFT ══ */}
          <div className="hn-left">
            {/* Available badge */}
            <div className="hn-available">
              <span className="hn-available__dot" aria-hidden="true" />
              Available for new projects
            </div>

            {/* Name */}
            <h1 className="hn-name">
              Md. Johirul Islam <span className="hn-name__accent">Rasel</span>
            </h1>

            {/* Typed role */}
            <div className="hn-role" aria-live="polite">
              <span className="hn-role__prefix">I{"'"}m a </span>
              <span className="hn-role__typed">
                {mounted ? typed : "Software Engineer."}
              </span>
              <span className="hn-role__cursor" aria-hidden="true" />
            </div>

            {/* Bio */}
            <p className="hn-bio">
              Software Engineer with <strong>4+ years </strong> of experience
              building modern, scalable, and high-performance web applications.
              Passionate about creating exceptional user experiences, solving
              complex problems, and continuously expanding my skills toward
              becoming a <strong>Full-Stack Software Engineer</strong> while
              contributing with honesty, dedication, and hard work.
            </p>

            {/* CTAs */}
            <div className="hn-cta">
              <Link href="/start-a-project" className="hn-btn hn-btn--primary">
                Hire Me Now <MoveRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/Johirul_Islam_CV.pdf"
                className="hn-btn hn-btn--outline"
                download
              >
                <Download className="w-4 h-4" /> Download CV
              </Link>
              {/* <Link href="#video-intro" className="hn-btn hn-btn--ghost">
                <Play className="w-4 h-4" />
                View Short Video
              </Link> */}
            </div>

            {/* Stats */}
            <div className="hn-stats">
              <div className="hn-stat">
                <span className="hn-stat__val">{myAge}</span>
                <span className="hn-stat__label">Years Old</span>
              </div>
              <div className="hn-stats__divider" />

              <div className="hn-stat">
                <span className="hn-stat__val">{yearsCount}+</span>
                <span className="hn-stat__label">Years of Experience</span>
              </div>
              <div className="hn-stats__divider" />
              <div className="hn-stat">
                <span className="hn-stat__val">{clientsCount}+</span>
                <span className="hn-stat__label">Happy Clients</span>
              </div>
            </div>
          </div>

          {/* ══ RIGHT ══ */}
          <div className="hn-right ">
            <div className="hn-photo-wrap">
              {/* Decorative rings */}
              <div className="hn-photo-wrap__glow" aria-hidden="true" />
              <div className="hn-photo-wrap__ring" aria-hidden="true" />

              {/* Photo */}
              <Tilt3D max={9} lift={18} className="hn-photo-frame">
                <Image
                  src={anamulHasan}
                  alt="Johirul Islam Rasel — Software Engineer"
                  fill
                  sizes="(max-width: 600px) 90vw, (max-width: 960px) 65vw, 36vw"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                  priority
                />
                {/* Scan line shimmer */}
                <div className="hn-photo-frame__scan" aria-hidden="true" />
              </Tilt3D>

              {/* Badge: Projects */}
              <div className="hn-badge hn-badge--projects">
                <span className="hn-badge__eyebrow ">Projects</span>
                <span className="hn-badge__val">{projectsCount}+</span>
                <span className="hn-badge__sub">Delivered</span>
              </div>

              {/* Badge: Success */}
              <div className="hn-badge hn-badge--countries">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <span className="hn-badge__eyebrow">Success Rate</span>
                  <span className="hn-badge__val">99%</span>
                </div>
              </div>

              {/* Badge: Experience */}
              <div className="hn-badge hn-badge--exp">
                <span className="hn-badge__eyebrow">Experience</span>
                <span className="hn-badge__val">4+</span>
                <span className="hn-badge__sub">Years</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Skills ticker */}
      <div className="hn-ticker max-w-[1620px] mx-auto">
        <div className="hn-ticker__track" aria-hidden="true">
          {[...SKILLS, ...SKILLS]?.map((s, i) => (
            <span key={i} className="hn-ticker__pill">
              {s}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroBanner;