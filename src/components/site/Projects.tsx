"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GithubIcon as Github } from "@/lib/social";
import { useMemo, useState } from "react";
import type { Project } from "@/content/schema";
import { TechIcon, iconLabel } from "@/lib/icons";
import ProjectCover from "./ProjectCover";

const statusTone: Record<string, string> = {
  Live: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "In development": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "Case study": "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  Archived: "bg-zinc-500/15 text-muted",
};

function Status({ s }: { s?: string }) {
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusTone[s] ?? ""}`}>
      {s === "Live" && <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" />}
      {s}
    </span>
  );
}

function Links({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/projects/${p.slug}`} className="btn-primary !py-2.5">
        Case study <ArrowRight className="h-4 w-4" />
      </Link>
      {p.liveUrl && (
        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2.5">
          Live <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
      {p.repoUrl && (
        <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Source code" className="btn-ghost !px-3 !py-2.5">
          <Github className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ["All", ...new Set(projects.map((p) => p.category))], [projects]);
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? projects : projects.filter((p) => p.category === cat);
  const featured = cat === "All" ? list.filter((p) => p.featured).slice(0, 3) : [];
  const rest = list.filter((p) => !featured.includes(p));

  return (
    <>
      <div className="mb-10 flex justify-center">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border bg-card p-1 [scrollbar-width:none]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${cat === c ? "text-bg" : "text-soft hover:text-fg"}`}
            >
              {cat === c && <motion.span layoutId="proj-pill" className="absolute inset-0 rounded-full bg-fg" />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured case studies */}
      <div className="space-y-6">
        {featured.map((p, i) => (
          <motion.article
            key={p._id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="panel group grid overflow-hidden lg:grid-cols-2"
          >
            <Link href={`/projects/${p.slug}`} className={`block self-center p-3 sm:p-4 ${i % 2 ? "lg:order-last" : ""}`} aria-label={`${p.title} case study`}>
              <ProjectCover project={p} priority={i === 0} />
            </Link>
            <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                <span style={{ color: p.accent || undefined }}>{String(i + 1).padStart(2, "0")}</span>
                <span>/ {p.category}</span>
                {p.year && <span>· {p.year}</span>}
                <Status s={p.status} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h3>
                {p.role && <p className="mt-1 text-sm text-muted">{p.role}{p.client ? ` · ${p.client}` : ""}</p>}
              </div>
              <p className="text-pretty leading-relaxed text-soft">{p.summary}</p>
              {(p.problem || p.solution) && (
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {p.problem && (
                    <div className="rounded-xl border bg-elev/60 p-3">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Problem</dt>
                      <dd className="mt-1 line-clamp-3 text-soft">{p.problem}</dd>
                    </div>
                  )}
                  {p.solution && (
                    <div className="rounded-xl border bg-elev/60 p-3">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-ink">Solution</dt>
                      <dd className="mt-1 line-clamp-3 text-soft">{p.solution}</dd>
                    </div>
                  )}
                </dl>
              )}
              {!!p.metrics?.length && (
                <div className="flex flex-wrap gap-6">
                  {p.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-2xl font-bold">{m.value}</p>
                      <p className="text-xs text-muted">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {p.stack?.map((k) => (
                  <span key={k} className="chip">
                    <TechIcon name={k} className="h-3.5 w-3.5" /> {iconLabel(k)}
                  </span>
                ))}
              </div>
              <Links p={p} />
            </div>
          </motion.article>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${featured.length ? "mt-6" : ""}`}>
        <AnimatePresence mode="popLayout">
          {rest.map((p) => (
            <motion.article
              layout
              key={p._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="panel panel-hover group flex flex-col overflow-hidden"
            >
              <Link href={`/projects/${p.slug}`} className="block p-2.5" aria-label={`${p.title} case study`}>
                <ProjectCover project={p} sizes="(max-width: 640px) 100vw, 400px" />
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    {p.category}
                    {p.year && ` · ${p.year}`}
                  </span>
                  <Status s={p.status} />
                </div>
                <h3 className="text-lg font-semibold">
                  <Link href={`/projects/${p.slug}`} className="hover:text-accent-ink">
                    {p.title}
                  </Link>
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-soft">{p.summary}</p>
                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <div className="flex gap-1.5">
                    {p.stack?.slice(0, 5).map((k) => (
                      <TechIcon key={k} name={k} className="h-4 w-4" />
                    ))}
                  </div>
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-soft hover:text-accent-ink">
                      Visit <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
