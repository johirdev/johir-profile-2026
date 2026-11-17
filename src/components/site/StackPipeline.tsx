import { ArrowUpRight, Cpu } from "lucide-react";
import type { AiTool, Service, StackGroup } from "@/content/schema";
import { TechIcon } from "@/lib/icons";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

function StageHeader({ n, kicker, title, count }: { n: string; kicker: string; title: string; count?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-fg font-mono text-xs font-bold text-bg">{n}</span>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-ink">{kicker}</p>
          <h3 className="text-lg font-semibold leading-tight sm:text-xl">{title}</h3>
        </div>
      </div>
      {count && <span className="chip font-mono">{count}</span>}
    </div>
  );
}

/** Animated "data flowing" connector between stages. */
function Flow({ converge }: { converge: boolean }) {
  const paths = [10, 30, 50, 70, 90].map((x) =>
    converge ? `M ${x} 0 C ${x} 50, 50 40, 50 100` : `M 50 0 C 50 60, ${x} 50, ${x} 100`,
  );
  return (
    <div aria-hidden className="relative mx-auto h-16 w-full max-w-3xl sm:h-24">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="rgb(var(--line) / 0.15)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            <path
              d={d}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeWidth="1.5"
              strokeDasharray="4 16"
              vectorEffect="non-scaling-stroke"
              className="animate-flow"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          </g>
        ))}
      </svg>
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 animate-pulse-dot rounded-full bg-accent" />
    </div>
  );
}

export default function StackPipeline({
  stack,
  tools,
  services,
}: {
  stack: StackGroup[];
  tools: AiTool[];
  services: Service[];
}) {
  const techCount = stack.reduce((n, g) => n + (g.items?.length ?? 0), 0);
  const half = Math.ceil(tools.length / 2);

  return (
    <section id="stack" className="relative py-12 sm:py-16">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="shell">
        <SectionHeading
          index="02"
          eyebrow="Stack & services"
          title="The right stack, powered by AI,"
          accent="delivered as results."
          intro="My workflow runs like a pipeline: a modern, proven stack goes in, AI accelerates the engineering under my review, and production-ready software comes out."
        />

        {/* ── Stage 1 ── */}
        <Reveal className="panel bg-card/80 p-4 backdrop-blur sm:p-6">
          <StageHeader n="01" kicker="Start" title="Technologies & languages" count={`${techCount}+`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((g, gi) => (
              <Reveal key={g._id} delay={gi * 0.05} className="rounded-xl border bg-bg/60 p-4 transition hover:border-accent/40">
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  <TechIcon name={g.icon} mono className="h-3.5 w-3.5 text-accent" /> {g.name}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {g.items?.map((t) => (
                    <li key={t.name} className="chip !text-fg transition hover:-translate-y-0.5 hover:border-accent/40">
                      <TechIcon name={t.icon} className="h-3.5 w-3.5" /> {t.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Flow converge />

        {/* ── Stage 2 ── */}
        <Reveal className="panel bg-card/80 p-4 backdrop-blur sm:p-6">
          <StageHeader n="02" kicker="Processing" title="AI-powered engineering" count={`${tools.length} AI tools`} />
          <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <ToolColumn tools={tools.slice(0, half)} />
            <div className="order-first flex flex-col items-center py-4 lg:order-none lg:px-6">
              <div className="relative grid h-36 w-36 place-items-center sm:h-44 sm:w-44">
                <div className="absolute inset-0 animate-spin-slow rounded-full [background:conic-gradient(from_0deg,transparent,rgb(var(--accent))_25%,transparent_45%)] [animation-duration:6s]" />
                <div className="absolute inset-[3px] rounded-full bg-card" />
                <div className="absolute inset-[14%] rounded-full border border-dashed border-accent/40" />
                <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-fg text-bg shadow-[0_0_60px_-10px_rgb(var(--accent))] sm:h-20 sm:w-20">
                  <Cpu className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
              </div>
              <p className="mt-3 font-semibold">AI Engine</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">human-reviewed output</p>
            </div>
            <ToolColumn tools={tools.slice(half)} />
          </div>
        </Reveal>

        <Flow converge={false} />

        {/* ── Stage 3 ── */}
        <Reveal className="panel bg-card/80 p-4 backdrop-blur sm:p-6">
          <StageHeader n="03" kicker="Output" title="Services I deliver" count={String(services.length)} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s._id} delay={i * 0.05} as="article" className="group relative overflow-hidden rounded-xl border bg-bg/60 p-5 transition hover:-translate-y-1 hover:border-accent/50">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/0 blur-2xl transition group-hover:bg-accent/20" />
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border bg-card text-accent">
                    <TechIcon name={s.icon} mono className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:rotate-45 group-hover:text-accent" />
                </div>
                <h4 className="mt-4 font-semibold">{s.title}</h4>
                {s.description && <p className="mt-1.5 text-sm leading-relaxed text-soft">{s.description}</p>}
                {!!s.deliverables?.length && (
                  <ul className="mt-3 grid grid-cols-1 gap-1 text-xs text-soft">
                    {s.deliverables.slice(0, 4).map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-accent" /> {d}
                      </li>
                    ))}
                  </ul>
                )}
                {!!s.stack?.length && (
                  <div className="mt-4 flex gap-1.5 border-t pt-3">
                    {s.stack.map((k) => (
                      <TechIcon key={k} name={k} className="h-4 w-4" />
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ToolColumn({ tools }: { tools: AiTool[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
      {tools.map((t) => (
        <li key={t._id} className="group flex items-center gap-3 rounded-xl border bg-bg/60 p-2.5 transition hover:border-accent/50">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-card transition group-hover:scale-110">
            <TechIcon name={t.icon} className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{t.name}</span>
            {t.use && <span className="hidden truncate text-[11px] text-muted sm:block">{t.use}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
