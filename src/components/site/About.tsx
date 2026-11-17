import { ArrowUpRight, Briefcase, Check, ChevronDown, GraduationCap, MapPin, Route } from "lucide-react";
import type { AboutSettings, Education, Experience, Milestone } from "@/content/schema";
import { TechIcon, iconLabel } from "@/lib/icons";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";

const subhead = "mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted";

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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          {/* ── Left: who I am + education ── */}
          <div className="flex flex-col gap-6">
            <Reveal className="panel relative overflow-hidden">
              <span className="bg-brand absolute inset-x-0 top-0 h-1" />
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-7">
                {about.portrait && (
                  <div className="bg-brand mx-auto h-28 w-28 shrink-0 rounded-2xl p-[2px] sm:mx-0">
                    <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-card">
                      <SmartImage src={about.portrait} alt="Johirul Islam Rasel, frontend software engineer from Bangladesh" fill sizes="112px" className="object-cover object-top" />
                    </div>
                  </div>
                )}
                <div className="space-y-3 text-pretty text-[15px] leading-relaxed text-soft">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
              {!!about.facts?.length && (
                <dl className="grid grid-cols-2 gap-px border-t bg-[rgb(var(--line)/var(--line-alpha))] sm:grid-cols-4">
                  {about.facts.map((f) => (
                    <div key={f.label} className="bg-card px-4 py-3.5 sm:px-5">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{f.label}</dt>
                      <dd className="mt-1 text-sm font-semibold leading-snug">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Reveal>

            {!!education.length && (
              <Reveal>
                <h3 className={subhead}>
                  <GraduationCap className="h-4 w-4 text-accent" /> Education
                </h3>
                <ul className="panel divide-y">
                  {education.map((ed) => (
                    <li key={ed._id} className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {ed.degree}
                          {ed.subject && <span className="font-normal text-muted"> · {ed.subject}</span>}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-soft">{ed.institution}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-[11px] text-muted">{ed.period}</span>
                        {ed.result && (
                          <span className={`text-[11px] font-semibold ${ed.status === "In progress" ? "text-accent-ink" : "text-soft"}`}>{ed.result}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* ── Right: experience timeline ── */}
          <Reveal>
            <h3 className={subhead}>
              <Briefcase className="h-3.5 w-3.5 text-accent" /> Experience
            </h3>
            <ol className="relative space-y-3">
              {experiences.map((e, i) => (
                <Reveal as="li" key={e._id} delay={i * 0.06} className="panel panel-hover relative p-4 sm:p-5">
                  <header className="flex items-start gap-3.5">
                    <div className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white ${e.current ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}>
                      {e.logo ? (
                        <SmartImage src={e.logo} alt="" fill sizes="40px" className="object-contain p-1" />
                      ) : (
                        <span className="text-sm font-bold text-zinc-900">{e.company.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <h4 className="font-semibold leading-tight">{e.role}</h4>
                        <span className="font-mono text-[11px] text-muted">{e.period}</span>
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-soft">
                        {e.url ? (
                          <a href={e.url} target="_blank" rel="noopener noreferrer" className="font-medium text-fg hover:text-accent-ink">
                            {e.company}
                          </a>
                        ) : (
                          <span className="font-medium text-fg">{e.company}</span>
                        )}
                        {e.workType && <span className="text-muted">· {e.workType}</span>}
                        {e.location && (
                          <span className="inline-flex items-center gap-0.5 text-muted">
                            · <MapPin className="h-3 w-3" /> {e.location}
                          </span>
                        )}
                        {e.current && (
                          <span className="bg-brand ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-accent">Now</span>
                        )}
                      </p>
                    </div>
                  </header>

                  {e.summary && <p className="mt-3 text-sm leading-relaxed text-soft">{e.summary}</p>}

                  {!!e.stack?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.stack.map((k) => (
                        <span key={k} title={iconLabel(k)} className="grid h-7 w-7 place-items-center rounded-lg border bg-elev">
                          <TechIcon name={k} className="h-3.5 w-3.5" />
                        </span>
                      ))}
                    </div>
                  )}

                  {(!!e.highlights?.length || !!e.links?.length) && (
                    <details className="group/hl mt-3 border-t pt-3">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-accent-ink [&::-webkit-details-marker]:hidden">
                        Key contributions{e.links?.length ? " & work" : ""}
                        <ChevronDown className="h-3.5 w-3.5 transition group-open/hl:rotate-180" />
                      </summary>
                      {!!e.highlights?.length && (
                        <ul className="mt-3 space-y-1.5">
                          {e.highlights.map((h) => (
                            <li key={h} className="flex gap-2 text-sm leading-relaxed text-soft">
                              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" /> {h}
                            </li>
                          ))}
                        </ul>
                      )}
                      {!!e.links?.length && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {e.links.map((l) =>
                            l.url ? (
                              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="chip hover:border-accent/50 hover:text-fg">
                                {l.name} <ArrowUpRight className="h-3 w-3" />
                              </a>
                            ) : (
                              <span key={l.name} className="chip">{l.name}</span>
                            ),
                          )}
                        </div>
                      )}
                    </details>
                  )}
                </Reveal>
              ))}
            </ol>
          </Reveal>
        </div>

        {/* ── Full width: how I learned my stack ── */}
        {!!journey.length && (
          <Reveal className="mt-10">
            <h3 className={subhead}>
              <Route className="h-3.5 w-3.5 text-accent" /> How I learned my stack
            </h3>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {journey.map((m, i) => (
                <Reveal as="li" key={m._id} delay={i * 0.05} className="panel panel-hover relative flex flex-col p-4">
                  <span className="text-brand font-mono text-sm font-bold">{m.year}</span>
                  <h4 className="mt-1 text-sm font-semibold leading-snug">{m.title}</h4>
                  {m.description && <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-soft" title={m.description}>{m.description}</p>}
                  {!!m.icons?.length && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-3">
                      {m.icons.map((k) => (
                        <span key={k} title={iconLabel(k)} className="grid h-6 w-6 place-items-center rounded-md border bg-elev">
                          <TechIcon name={k} className="h-3 w-3" />
                        </span>
                      ))}
                    </div>
                  )}
                </Reveal>
              ))}
            </ol>
            {!!about.principles?.length && (
              <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {about.principles.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs leading-relaxed text-soft">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {p}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
