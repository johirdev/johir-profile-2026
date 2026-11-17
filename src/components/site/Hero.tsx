"use client";

import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HeroRole, HeroSettings, SiteSettings } from "@/content/schema";
import { TechIcon, iconLabel } from "@/lib/icons";
import SmartImage from "@/components/ui/SmartImage";

const EASE = [0.22, 1, 0.36, 1] as const;
const FALLBACK_ROLE: HeroRole = { title: "Software Engineer", accent: "#ff6333", icons: [], image: "/images/johirul-islam-rasel-software-engineer.png" };

export default function Hero({
  hero,
  site,
  resumeUrl,
}: {
  hero: HeroSettings;
  site: SiteSettings;
  resumeUrl?: string;
}) {
  const roles = hero.roles?.length ? hero.roles : [FALLBACK_ROLE];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const seconds = Math.min(30, Math.max(3, hero.rotateSeconds || 6));
  const role = roles[index % roles.length];
  const accent = role.accent || "#ff6333";

  const next = useCallback(() => setIndex((i) => (i + 1) % roles.length), [roles.length]);

  useEffect(() => {
    if (paused || roles.length < 2) return;
    const t = setTimeout(next, seconds * 1000);
    return () => clearTimeout(t);
  }, [index, paused, seconds, next, roles.length]);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="home"
        aria-label="Introduction"
        className="noise relative isolate overflow-hidden pb-8 pt-24 sm:pt-28 lg:pb-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Backdrop: grid, role-tinted aurora, horizon line */}
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 h-[620px] w-[620px] rounded-full opacity-30 blur-[120px] dark:opacity-40"
          animate={{ backgroundColor: accent }}
          transition={{ duration: 1.2, ease: EASE }}
        />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px]" />
        {/* Soft fade into the next section instead of a hard edge */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-bg" />

        <div className="shell grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* ── Visual (first on mobile) ── */}
          <div className="order-first lg:order-last">
            <Stage role={role} index={index} accent={accent} />
          </div>

          {/* ── Copy ── */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              {site.available && (
                <span className="chip !py-1.5">
                  <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-500" />
                  {site.availabilityText || "Available for work"}
                </span>
              )}
              <span className="chip !py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> AI-native workflow
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
              className="mb-3 text-lg font-medium text-soft sm:text-xl"
            >
              {hero.greeting}
            </motion.p>

            <h1 className="text-[clamp(1.85rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              <motion.span
                className="mb-2 block text-[0.6em] font-semibold leading-tight tracking-tight text-fg/90"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.14, ease: EASE }}
              >
                {hero.headline}
              </motion.span>
              <span className="relative block min-h-[1.15em] whitespace-nowrap" aria-live="polite">
                <AnimatePresence mode="wait">
                  <RoleWord key={role.title + index} text={role.title} accent={accent} />
                </AnimatePresence>
              </span>
            </h1>

            <div className="mt-6 min-h-[8.5rem] max-w-xl sm:min-h-[7rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {role.tagline && (
                    <p className="role-tint mb-2 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
                      {"// "}
                      {role.tagline}
                    </p>
                  )}
                  <p className="text-pretty text-base leading-relaxed text-soft sm:text-lg">{role.description || hero.bio}</p>
                </motion.div>
              </AnimatePresence>
            </div>

           

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={hero.primaryHref || "#contact"} className="btn-primary">
                {hero.primaryLabel || "Start a project"} <ArrowUpRight className="h-4 w-4" />
              </Link>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener" className="btn-ghost">
                  <Download className="h-4 w-4" /> Download CV
                </a>
              )}
              <Link href="#work" className="btn hidden px-3 text-soft hover:text-fg sm:inline-flex">
                View work <ArrowDown className="h-4 w-4" />
              </Link>
            </div>

            {!!hero.stats?.length && (
              <dl className="mt-8 grid max-w-lg grid-cols-3 divide-x rounded-2xl border bg-card/60 backdrop-blur">
                {hero.stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                    className="px-3 py-4 text-center sm:px-5"
                  >
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</dd>
                    <dd className="mt-1 text-[11px] text-muted sm:text-xs">{s.label}</dd>
                  </motion.div>
                ))}
              </dl>
            )}
          </div>
        </div>
        <style>{`@keyframes heroProgress{from{width:0}to{width:100%}}`}</style>
      </section>
    </MotionConfig>
  );
}

/** Role title revealed letter by letter with a blur-in. */
function RoleWord({ text, accent }: { text: string; accent: string }) {
  const words = text.split(" ");
  return (
    <motion.span className="role-word block" initial="hidden" animate="show" exit="exit" style={{ color: accent }}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {w.split("").map((ch, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: (wi * 6 + ci) * 0.025, duration: 0.45, ease: EASE } },
                exit: { opacity: 0, y: "-0.3em", filter: "blur(6px)", transition: { duration: 0.2 } },
              }}
            >
              {ch}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── Right-side stage ───────────────────────── */

function Stage({ role, index, accent }: { role: HeroRole; index: number; accent: string }) {
  const icons = useMemo(() => (role.icons ?? []).slice(0, 8), [role.icons]);
  const image = role.image || "/images/johirul-islam-rasel-software-engineer.png";

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(82vw,480px)] lg:mr-0">
      {/* Rings */}
      <div className="absolute inset-[3%] animate-spin-slow rounded-full border border-dashed border-[rgb(var(--line)/0.14)]" />
      <div className="absolute inset-[16%] animate-spin-rev rounded-full border border-[rgb(var(--line)/0.1)]" />
      <motion.div
        aria-hidden
        className="absolute inset-[22%] rounded-full blur-3xl"
        animate={{ backgroundColor: accent, opacity: 0.35 }}
        transition={{ duration: 1, ease: EASE }}
      />

      {/* Platform disc behind the portrait */}
      <motion.div
        className="absolute inset-x-[14%] bottom-[4%] top-[18%] overflow-hidden rounded-full"
        animate={{ background: `radial-gradient(circle at 50% 30%, ${accent}55, ${accent}12 55%, transparent 72%)` }}
        transition={{ duration: 1, ease: EASE }}
      >
        <div className="grid-bg absolute inset-0 opacity-60" />
      </motion.div>

      {/* Portrait — swaps with a lift + clip reveal when the role's image changes */}
      <div className="absolute inset-x-[10%] bottom-0 top-[2%] [mask-image:linear-gradient(to_bottom,black_78%,transparent)]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={image + (image === "/images/johirul-islam-rasel-software-engineer.png" ? "" : index)}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 40, scale: 0.96, clipPath: "inset(100% 0 0 0)" }}
            animate={{ opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0 0 0)" }}
            exit={{ opacity: 0, y: -20, scale: 1.02 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <SmartImage
              src={image}
              alt="Johirul Islam Rasel — Software Engineer"
              fill
              priority
              sizes="(max-width: 1024px) 82vw, 480px"
              className="object-contain object-bottom drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Technology icons placed on the orbit ring, each floating gently */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {icons.map((key, i) => {
            const angle = (i / icons.length) * Math.PI * 2 - Math.PI / 2;
            const r = 46;
            return (
              <motion.div
                key={`${index}-${key}`}
                className="absolute"
                style={{ left: `${50 + r * Math.cos(angle)}%`, top: `${50 + r * Math.sin(angle)}%` }}
                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2, delay: i * 0.02 } }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 + i * 0.07 }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.2 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                    className="group grid h-10 w-10 place-items-center rounded-xl border bg-card/90 shadow-lg backdrop-blur-md sm:h-12 sm:w-12"
                    style={{ boxShadow: `0 10px 30px -12px ${accent}` }}
                    title={iconLabel(key)}
                  >
                    <TechIcon name={key} className="h-[18px] w-[18px] sm:h-6 sm:w-6" title={iconLabel(key)} />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating code card */}
      <AnimatePresence mode="wait">
        {role.code && (
          <motion.div
            key={`code-${index}`}
            initial={{ opacity: 0, x: -24, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            exit={{ opacity: 0, x: -16, rotate: -4 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
            className="absolute left-0 -bottom-[2%] w-[50%] max-w-[220px] sm:bottom-[7%] overflow-hidden rounded-xl border border-white/20 bg-zinc-950/30 text-zinc-50 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-white/5 backdrop-blur-[3px] backdrop-saturate-150 [text-shadow:0_1px_2px_rgb(0_0_0/0.65)] sm:-left-4"
            style={{ backgroundImage: `linear-gradient(135deg, ${accent}2e, transparent 60%)` }}
          >
            <div className="flex items-center gap-1.5 border-b border-white/15 bg-white/[0.04] px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 truncate font-mono text-[10px] text-zinc-400">{role.codeTitle}</span>
            </div>
            <pre className="overflow-hidden px-2.5 py-2 font-mono text-[8px] leading-[1.55] sm:text-[9.5px]">
              {role.code.split("\n").slice(0, 5).map((line, i) => (
                <motion.code
                  key={i}
                  className="block whitespace-pre"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.09 }}
                >
                  <span className="mr-3 select-none text-white/40">{i + 1}</span>
                  <Colorize line={line} accent={accent} />
                </motion.code>
              ))}
              <span className="ml-6 inline-block h-3 w-1.5 animate-blink align-middle" style={{ background: accent }} />
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`badge-${index}`}
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="panel absolute -right-1 top-[10%] hidden max-w-[60%] sm:flex items-center gap-2.5 px-3 py-2.5 shadow-xl sm:right-0"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${accent}22` }}>
            <TechIcon name={role.icons?.[0]} className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold sm:text-sm">{role.title}</span>
            <span className="block truncate text-[10px] text-muted sm:text-xs">{role.tagline}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Tiny keyword tint for the decorative code card. */
function Colorize({ line, accent }: { line: string; accent: string }) {
  const parts = line.split(/(\b(?:export|default|async|function|const|await|return|if|func|import|from|jobs|steps|runs-on|uses|run)\b|"[^"]*"|\/\/.*$)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^(export|default|async|function|const|await|return|if|func|import|from|jobs|steps|runs-on|uses|run)$/.test(p) ? (
          <span key={i} style={{ color: accent }}>{p}</span>
        ) : p.startsWith('"') ? (
          <span key={i} className="text-[#a5e075]">{p}</span>
        ) : p.startsWith("//") ? (
          <span key={i} className="italic text-zinc-500">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
