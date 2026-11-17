import type { AiTool, Metric, Reason, Service, StackGroup } from "@/content/schema";
import { TechIcon, iconLabel } from "@/lib/icons";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const COLUMNS = [
  { stage: "Foundation", n: "01", kicker: "Start", title: "Modern, proven stack" },
  { stage: "Process", n: "02", kicker: "Processing", title: "AI-powered engineering" },
  { stage: "Outcome", n: "03", kicker: "Output", title: "Results you can rely on" },
] as const;

export default function WhyChooseMe({
  reasons,
  stack,
  tools,
  services,
  stats,
}: {
  reasons: Reason[];
  stack: StackGroup[];
  tools: AiTool[];
  services: Service[];
  stats?: Metric[];
}) {
  const techIcons = [...new Set(stack.flatMap((g) => g.items?.map((i) => i.icon).filter(Boolean) as string[]))].slice(0, 14);
  const techCount = stack.reduce((n, g) => n + (g.items?.length ?? 0), 0);

  const summaries: Record<string, React.ReactNode> = {
    Foundation: (
      <>
        <div className="flex flex-wrap gap-1.5">
          {techIcons.map((k) => (
            <span key={k} title={iconLabel(k)} className="grid h-9 w-9 place-items-center rounded-lg border bg-card">
              <TechIcon name={k} className="h-4 w-4" />
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">{techCount}+ technologies across frontend, backend, data, cloud and design.</p>
      </>
    ),
    Process: (
      <>
        <div className="flex flex-wrap gap-1.5">
          {tools.map((t) => (
            <span key={t._id} title={t.name} className="grid h-9 w-9 place-items-center rounded-lg border bg-card">
              <TechIcon name={t.icon} className="h-4 w-4" />
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">{tools.length} AI tools in my workflow — every output reviewed and tested by me.</p>
      </>
    ),
    Outcome: (
      <>
        <div className="flex flex-wrap gap-1.5">
          {services.map((s) => (
            <span key={s._id} className="chip !text-fg">
              <TechIcon name={s.icon} mono className="h-3.5 w-3.5 text-accent" /> {s.title}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Working, documented products — not just code handed over.</p>
      </>
    ),
  };

  return (
    <section id="why" className="relative overflow-hidden py-12 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="shell">
        <SectionHeading
          index="03"
          eyebrow="Why choose me"
          title="An engineer who owns the outcome,"
          accent="not just the ticket."
          intro="I start with a stack chosen for your product, move fast with AI under expert review, and finish with software that ships on time — documented and supported."
        />

        <div className="relative grid gap-6 lg:grid-cols-3">
          <div aria-hidden className="absolute left-[16%] right-[16%] top-5 hidden h-px bg-gradient-to-r from-transparent via-[rgb(var(--line)/0.2)] to-transparent lg:block" />
          {COLUMNS.map((col, ci) => (
            <div key={col.stage} className="flex flex-col gap-4">
              <Reveal delay={ci * 0.1} className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fg to-fg/70 font-mono text-xs font-bold text-bg">
                  {col.n}
                </span>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-ink">{col.kicker}</p>
                  <h3 className="font-semibold">{col.title}</h3>
                </div>
              </Reveal>
              <Reveal delay={ci * 0.1 + 0.05} className="rounded-2xl border border-dashed bg-card/50 p-4">
                {summaries[col.stage]}
              </Reveal>
              {reasons
                .filter((r) => r.stage === col.stage)
                .map((r, i) => (
                  <Reveal key={r._id} delay={ci * 0.1 + 0.1 + i * 0.06} className="panel panel-hover group flex gap-4 p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-elev text-accent transition group-hover:bg-accent group-hover:text-on-accent">
                      <TechIcon name={r.icon} mono className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="font-semibold">{r.title}</h4>
                      {r.description && <p className="mt-1.5 text-sm leading-relaxed text-soft">{r.description}</p>}
                    </div>
                  </Reveal>
                ))}
            </div>
          ))}
        </div>

        {!!stats?.length && (
          <Reveal className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-[rgb(var(--line)/0.09)] sm:grid-cols-4">
            {[...stats, { value: "100%", label: "Code reviewed by me" }].slice(0, 4).map((s) => (
              <div key={s.label} className="bg-card p-6 text-center">
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
