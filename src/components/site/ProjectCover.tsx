import type { Project } from "@/content/schema";
import { TechIcon } from "@/lib/icons";
import SmartImage from "@/components/ui/SmartImage";

/** Real screenshot when one exists, otherwise a generated browser-window mock-up. */
export default function ProjectCover({ project, priority = false, sizes = "(max-width: 1024px) 100vw, 640px" }: { project: Project; priority?: boolean; sizes?: string }) {
  const accent = project.accent || "#ff6333";
  const host = (() => {
    try {
      return project.liveUrl ? new URL(project.liveUrl).host : `${project.slug}.app`;
    } catch {
      return project.slug;
    }
  })();

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-elev">
      {/* browser chrome */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 border-b bg-card/90 px-3 py-2 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="mx-auto truncate rounded-md bg-elev px-3 py-0.5 font-mono text-[10px] text-muted">{host}</span>
      </div>
      {project.cover ? (
        <SmartImage
          src={project.cover}
          alt={`${project.title} screenshot`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top pt-7 transition duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 pt-7" style={{ background: `radial-gradient(120% 90% at 0% 0%, ${accent}40, transparent 55%), radial-gradient(90% 90% at 100% 100%, ${accent}26, transparent 60%)` }}>
          <div className="grid-bg absolute inset-0 opacity-70" />
          <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
            <div className="flex gap-2">
              <span className="h-2 w-16 rounded-full bg-fg/15" />
              <span className="h-2 w-10 rounded-full bg-fg/10" />
              <span className="ml-auto h-2 w-12 rounded-full" style={{ background: accent }} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: accent }}>
                {project.category}
              </p>
              <p className="mt-1 line-clamp-2 text-[clamp(1.25rem,2.6vw,2.25rem)] font-bold leading-tight tracking-tight transition duration-500 group-hover:translate-x-1">{project.title}</p>
              <div className="mt-3 grid max-w-[70%] grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-10 rounded-lg border bg-card/70 sm:h-14" />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {project.stack?.slice(0, 6).map((k, i) => (
                <span
                  key={k}
                  className="grid h-9 w-9 place-items-center rounded-xl border bg-card shadow-sm transition duration-500 group-hover:-translate-y-1"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <TechIcon name={k} className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
