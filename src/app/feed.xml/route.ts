import type { BlogPost } from "@/content/schema";
import { AUTHOR_NAME, SITE_URL } from "@/lib/seo";
import { listPublic } from "@/server/repo";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const posts = await listPublic<BlogPost>("blogs", 50);
  const items = posts
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}</link><guid>${SITE_URL}/blog/${p.slug}</guid>${
        p.createdAt ? `<pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>` : ""
      }<description>${esc(p.excerpt)}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(AUTHOR_NAME)} — Blog</title><link>${SITE_URL}/blog</link><description>Engineering notes on AI, Next.js, Go and automation.</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
