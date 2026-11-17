import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Project } from "@/content/schema";
import ProjectCover from "@/components/site/ProjectCover";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import { TechIcon, iconLabel } from "@/lib/icons";
import { GithubIcon } from "@/lib/social";
import { pageMetadata } from "@/lib/seo";
import { findPublicBySlug, listPublic } from "@/server/repo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await findPublicBySlug<Project>("projects", slug);
  if (!p) return { title: "Project not found" };
  return pageMetadata({ title: `${p.title} — case study`, description: p.summary, path: `/projects/${p.slug}`, image: p.cover || undefined });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = await findPublicBySlug<Project>("projects", slug);
  if (!p) notFound();
  const all = await listPublic<Project>("projects");
  const idx = all.findIndex((x) => x.slug === p.slug);
  const next = all[(idx + 1) % all.length];
  const accent = p.accent || "#22b8de";

  const facts = [
    ["Role", p.role],
    ["Client", p.client],
    ["Year", p.year],
    ["Duration", p.duration],
    ["Status", p.status],
    ["Category", p.category],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <article className="relative pb-24 pt-28 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-40" style={{ background: `radial-gradient(60% 60% at 30% 0%, ${accent}66, transparent 70%)` }} />
      <div className="shell">
        <Link href="/#work" className="mb-8 inline-flex items-center gap-2 text-sm text-soft hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>

        <header className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>Case study · {p.category}</p>
            <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.02] tracking-tight sm:text-7xl">{p.title}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-soft sm:text-xl">{p.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Visit live site <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {p.repoUrl && (
                <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <GithubIcon className="h-4 w-4" /> Source code
                </a>
              )}
            </div>
          </div>
          {facts.length > 0 && (
            <dl className="panel grid grid-cols-2 divide-x divide-y overflow-hidden [&>*:nth-child(odd)]:border-l-0">
              {facts.map(([k, v]) => (
                <div key={k} className="p-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <Reveal className="mt-12">
          <ProjectCover project={p} priority sizes="(max-width: 1240px) 100vw, 1240px" />
        </Reveal>

        {!!p.metrics?.length && (
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-[rgb(var(--line)/0.09)] sm:grid-cols-4">
            {p.metrics.map((m) => (
              <div key={m.label} className="bg-card p-6">
                <p className="text-3xl font-bold" style={{ color: accent }}>{m.value}</p>
                <p className="mt-1 text-sm text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {p.problem && (
              <Reveal>
                <p className="label">01 — The problem</p>
                <p className="whitespace-pre-line text-pretty text-lg leading-relaxed text-soft">{p.problem}</p>
              </Reveal>
            )}
            {p.solution && (
              <Reveal>
                <p className="label">02 — The solution</p>
                <p className="whitespace-pre-line text-pretty text-lg leading-relaxed text-soft">{p.solution}</p>
              </Reveal>
            )}
            {!!p.features?.length && (
              <Reveal>
                <p className="label">03 — Key features</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="panel flex items-start gap-3 p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} /> {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {!!p.gallery?.length && (
              <div className="grid gap-4 sm:grid-cols-2">
                {p.gallery.map((g, i) => (
                  <figure key={i} className={i === 0 && p.gallery!.length % 2 ? "sm:col-span-2" : ""}>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border">
                      <SmartImage src={g.image} alt={g.caption || `${p.title} screenshot ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover" />
                    </div>
                    {g.caption && <figcaption className="mt-2 text-sm text-muted">{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            {!!p.stack?.length && (
              <div className="panel p-5">
                <p className="label">Tech stack</p>
                <ul className="grid gap-2">
                  {p.stack.map((k) => (
                    <li key={k} className="flex items-center gap-3 text-sm">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border bg-elev">
                        <TechIcon name={k} className="h-4 w-4" />
                      </span>
                      {iconLabel(k)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {next && next.slug !== p.slug && (
          <Link href={`/projects/${next.slug}`} className="panel panel-hover group mt-20 flex items-center justify-between gap-4 p-6 sm:p-8">
            <span>
              <span className="label">Next project</span>
              <span className="text-2xl font-semibold sm:text-3xl">{next.title}</span>
            </span>
            <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        )}
      </div>
    </article>
  );
}
