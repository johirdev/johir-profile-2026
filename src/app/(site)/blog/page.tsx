import type { Metadata } from "next";
import type { BlogPost } from "@/content/schema";
import BlogCard from "@/components/site/BlogCard";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { listPublic } from "@/server/repo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Blog — AI, Next.js, Go & automation",
  description: "Engineering notes by Johirul Islam Rasel on AI-assisted development, Next.js, Go backends and AI automation.",
  path: "/blog",
});

export default async function BlogIndex() {
  const posts = await listPublic<BlogPost>("blogs", 200);
  const sorted = [...posts].sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const [first, ...rest] = sorted;

  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="shell">
        <SectionHeading
          eyebrow="Blog"
          title="Notes from the"
          accent="engineering desk."
          intro="Practical writing on AI-assisted engineering, Next.js, Go and automation."
        />
        {first ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal className="sm:col-span-2 lg:col-span-3">
              <BlogCard post={first} large />
            </Reveal>
            {rest.map((p, i) => (
              <Reveal key={p._id} delay={(i % 3) * 0.06}>
                <BlogCard post={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-soft">No articles yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
