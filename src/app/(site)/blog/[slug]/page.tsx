import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import type { BlogPost } from "@/content/schema";
import BlogCard, { BlogCover, fmtDate } from "@/components/site/BlogCard";
import ReadingProgress from "@/components/site/ReadingProgress";
import { AUTHOR_NAME, PERSON_ID, SITE_URL, jsonLd, pageMetadata } from "@/lib/seo";
import { headings, renderMarkdown } from "@/server/markdown";
import { findPublicBySlug, listPublic } from "@/server/repo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublicBySlug<BlogPost>("blogs", slug);
  if (!post) return { title: "Article not found" };
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, image: post.cover || undefined, type: "article" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await findPublicBySlug<BlogPost>("blogs", slug);
  if (!post) notFound();

  const html = renderMarkdown(post.content);
  const toc = headings(post.content).filter((h) => h.depth === 2);
  const related = (await listPublic<BlogPost>("blogs", 20)).filter((p) => p.slug !== post.slug).slice(0, 3);
  const accent = post.accent || "#ff6333";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { "@type": "Person", "@id": PERSON_ID, name: AUTHOR_NAME },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags?.join(", "),
  };

  return (
    <article className="relative pb-24 pt-28 sm:pt-36">
      <ReadingProgress color={accent} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-40" style={{ background: `radial-gradient(60% 60% at 50% 0%, ${accent}55, transparent 70%)` }} />

      <header className="shell max-w-4xl">
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-soft hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {post.tags?.map((t) => (
            <span key={t} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${accent}1f`, color: accent }}>
              {t}
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
          </span>
          <span>· {fmtDate(post.createdAt)}</span>
        </div>
        <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{post.title}</h1>
        <p className="mt-5 text-pretty text-lg text-soft sm:text-xl">{post.excerpt}</p>
        <p className="mt-6 text-sm">
          By <span className="font-semibold">{AUTHOR_NAME}</span>
        </p>
        <BlogCover post={post} priority className="mt-10 aspect-[21/9]" />
      </header>

      <div className="shell mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_220px]">
        <div className="prose-pf min-w-0 max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
        {toc.length > 2 && (
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <p className="label">On this page</p>
              <ul className="space-y-2 border-l text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 text-soft transition hover:border-accent hover:text-fg">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="shell mt-24">
          <h2 className="mb-6 text-2xl font-semibold">Keep reading</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
