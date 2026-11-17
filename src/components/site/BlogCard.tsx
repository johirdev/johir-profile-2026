import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogPost } from "@/content/schema";
import SmartImage from "@/components/ui/SmartImage";

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

/** Cover image, or a typographic cover tinted with the post's accent. */
export function BlogCover({ post, className = "", priority = false }: { post: BlogPost; className?: string; priority?: boolean }) {
  const accent = post.accent || "#ff6333";
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-elev ${className}`}>
      {post.cover ? (
        <SmartImage src={post.cover} alt="" fill priority={priority} sizes="(max-width: 768px) 100vw, 600px" className="object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0" style={{ background: `radial-gradient(100% 120% at 100% 0%, ${accent}55, transparent 60%), radial-gradient(80% 80% at 0% 100%, ${accent}22, transparent 60%)` }}>
          <div className="grid-bg absolute inset-0 opacity-70" />
          <span className="absolute bottom-4 left-4 right-4 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
            {post.subject}
          </span>
          <span className="absolute right-4 top-3 text-6xl font-bold opacity-[0.08] transition duration-700 group-hover:opacity-20">{"{ }"}</span>
        </div>
      )}
    </div>
  );
}

export default function BlogCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <article className={`panel panel-hover group relative flex h-full flex-col overflow-hidden p-2.5 ${large ? "lg:flex-row" : ""}`}>
      <BlogCover post={post} className={large ? "aspect-[16/10] lg:aspect-auto lg:w-1/2" : "aspect-[16/9]"} priority={large} />
      <div className={`flex flex-1 flex-col gap-3 p-4 ${large ? "lg:justify-center lg:p-8" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {post.tags?.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent-ink">{t}</span>
          ))}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readMinutes ?? 5} min
          </span>
          <span>· {fmtDate(post.createdAt)}</span>
        </div>
        <h3 className={`font-semibold leading-snug tracking-tight ${large ? "text-2xl sm:text-3xl" : "text-lg"}`}>
          <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className={`text-sm leading-relaxed text-soft ${large ? "sm:text-base" : "line-clamp-3"}`}>{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium">
          Read article <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45 group-hover:text-accent" />
        </span>
      </div>
    </article>
  );
}
