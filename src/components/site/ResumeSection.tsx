import { Download, Eye, FileText, Sparkles } from "lucide-react";
import type { Experience, Resume } from "@/content/schema";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { fmtDate } from "./BlogCard";

export default function ResumeSection({ resume, experiences }: { resume?: Resume; experiences: Experience[] }) {
  if (!resume) return null;
  return (
    <section id="resume" className="relative py-12 sm:py-16">
      <div className="shell">
        <SectionHeading index="05" eyebrow="Resume" title="Everything on one page," accent="ready to share." />
        <Reveal className="panel relative grid overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fg text-bg">
                <FileText className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">{resume.title}</h3>
                <p className="font-mono text-xs text-muted">
                  {resume.version && <>Version {resume.version} · </>}Updated {fmtDate(resume.updatedAt || resume.createdAt) || "recently"}
                </p>
              </div>
            </div>
            {resume.summary && <p className="text-pretty leading-relaxed text-soft">{resume.summary}</p>}
            {!!resume.highlights?.length && (
              <ul className="grid gap-2">
                {resume.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {h}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3">
              <a href={resume.file} download className="btn-primary">
                <Download className="h-4 w-4" /> Download PDF
              </a>
              <a href={resume.file} target="_blank" rel="noopener" className="btn-ghost">
                <Eye className="h-4 w-4" /> View online
              </a>
            </div>
          </div>

          {/* Paper preview */}
          <div className="relative hidden border-l bg-elev/60 p-8 lg:block">
            <div className="mx-auto max-w-sm rotate-[1.5deg] rounded-xl border bg-card p-6 shadow-2xl transition duration-500 hover:rotate-0">
              <div className="mb-4 h-3 w-40 rounded bg-fg/80" />
              <div className="mb-6 h-2 w-24 rounded bg-accent" />
              {experiences.slice(0, 3).map((e) => (
                <div key={e._id} className="mb-4">
                  <p className="text-xs font-semibold">{e.role}</p>
                  <p className="text-[10px] text-muted">
                    {e.company} · {e.period}
                  </p>
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 w-full rounded bg-fg/10" />
                    <div className="h-1.5 w-4/5 rounded bg-fg/10" />
                  </div>
                </div>
              ))}
              <div className="mt-6 flex flex-wrap gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-3 rounded-full bg-fg/10" style={{ width: `${28 + ((i * 13) % 30)}px` }} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
