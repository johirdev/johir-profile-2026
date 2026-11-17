import { ArrowUpRight, Briefcase, GraduationCap, MapPin } from "lucide-react";
import type { AboutSettings, Education, Experience, Milestone } from "@/content/schema";
import { TechIcon, iconLabel } from "@/lib/icons";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";

export default function About({
  about,
  experiences,
  education,
  journey,
}: {
  about: AboutSettings;
  experiences: Experience[];
  education: Education[];
  journey: Milestone[];
}) {
  const paragraphs = (about.bio ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="about" className="relative py-12 sm:py-16">
      <div className="shell">
        <SectionHeading index="01" eyebrow="About me" title={about.heading ?? "About me"} />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          {/* ── Left: who I am + how I learned ── */}
          <div className="flex flex-col gap-8">
            <Reveal className="panel overflow-hidden">
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                {about.portrait && (
                  <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-b from-accent/25 to-transparent sm:mx-0">
                    <SmartImage src={about.portrait} alt="Johirul Islam Rasel, software engineer from Bangladesh" fill sizes="144px" className="object-cover object-top" />
                  </div>
                )}
                <div className="space-y-4 text-pretty leading-relaxed text-soft">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
              {!!about.facts?.length && (
                <dl className="grid grid-cols-2 border-t sm:grid-cols-4">
                  {about.facts.map((f, i) => (
                    <div key={f.label} className={`p-4 sm:p-5 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""} sm:border-l sm:first:border-l-0`}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{f.label}</dt>
                      <dd className="mt-1 text-sm font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Reveal>

            <Reveal>
              <h3 className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <span className="h-px w-8 bg-accent" /> How I learned my stack
              </h3>
              <ol className="relative space-y-3 border-l pl-6">
                {journey.map((m, i) => (
                  <Reveal as="li" key={m._id} delay={i * 0.05} className="relative">
                    <span className="absolute -left-[31px] top-4 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-bg bg-accent" />
                    <div className="panel panel-hover p-4 sm:p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-semibold">{m.title}</h4>
                        <span className="font-mono text-xs text-accent-ink">{m.year}</span>
                      </div>
                      {m.description && <p className="mt-1.5 text-sm leading-relaxed text-soft">{m.description}</p>}
                      {!!m.icons?.length && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.icons.map((k) => (
                            <span key={k} className="chip !px-2 !py-0.5">
                              <TechIcon name={k} className="h-3.5 w-3.5" /> {iconLabel(k)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
              </ol>
              {!!about.principles?.length && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                  {about.principles.map((p) => (
                    <li key={p} className="rounded-xl border border-dashed p-3 text-xs leading-relaxed text-soft">
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>

          {/* ── Right: experience + education ── */}
          <div className="flex flex-col gap-8">
            <Reveal>
              <h3 className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <Briefcase className="h-3.5 w-3.5 text-accent" /> Experience
              </h3>
              <div className="space-y-4">
                {experiences.map((e, i) => (
                  <Reveal key={e._id} delay={i * 0.06} as="article" className="panel panel-hover group relative overflow-hidden p-5 sm:p-6">
                    {e.current && <span className="absolute inset-y-0 left-0 w-1 bg-accent" />}
                    <header className="flex items-start gap-4">
                      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white">
                        {e.logo ? (
                          <SmartImage src={e.logo} alt="" fill sizes="48px" className="object-contain p-1.5" />
                        ) : (
                          <span className="font-bold text-zinc-900">{e.company.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold leading-tight">{e.role}</h4>
                          {e.current && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Current</span>}
                        </div>
                        <p className="mt-0.5 text-sm text-soft">
                          {e.url ? (
                            <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-medium text-fg hover:text-accent-ink">
                              {e.company}
                            </a>
                          ) : (
                            <span className="font-medium text-fg">{e.company}</span>
                          )}
                          {e.workType && <span className="text-muted"> · {e.workType}</span>}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-muted">
                          <span>{e.period}</span>
                          {e.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {e.location}
                            </span>
                          )}
                        </p>
                      </div>
                    </header>

                    {e.summary && <p className="mt-4 text-sm text-soft">{e.summary}</p>}
                    {!!e.highlights?.length && (
                      <ul className="mt-3 space-y-2">
                        {e.highlights.map((h) => (
                          <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-soft">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" /> {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {(!!e.stack?.length || !!e.links?.length) && (
                      <footer className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-4">
                        {e.stack?.map((k) => (
                          <span key={k} title={iconLabel(k)} className="grid h-7 w-7 place-items-center rounded-lg border bg-elev">
                            <TechIcon name={k} className="h-3.5 w-3.5" />
                          </span>
                        ))}
                        {e.links?.map((l) =>
                          l.url ? (
                            <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="chip hover:border-accent/50 hover:text-fg">
                              {l.name} <ArrowUpRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <span key={l.name} className="chip">{l.name}</span>
                          ),
                        )}
                      </footer>
                    )}
                  </Reveal>
                ))}
              </div>
            </Reveal>

            {!!education.length && (
              <Reveal>
                <h3 className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  <GraduationCap className="h-4 w-4 text-accent" /> Education
                </h3>
                <div className="panel divide-y">
                  {education.map((ed) => (
                    <div key={ed._id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div>
                        <p className="font-semibold">{ed.degree}</p>
                        <p className="text-sm text-soft">
                          {ed.institution}
                          {ed.subject && <span className="text-muted"> · {ed.subject}</span>}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <span className="font-mono text-xs text-muted">{ed.period}</span>
                        {ed.result && (
                          <span className={`chip !py-0.5 ${ed.status === "In progress" ? "!border-accent/40 !text-accent-ink" : ""}`}>{ed.result}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
