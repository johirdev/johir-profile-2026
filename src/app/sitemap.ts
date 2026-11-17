import type { MetadataRoute } from "next";
import type { BlogPost, Project } from "@/content/schema";
import { OG_IMAGE, PORTRAIT_FULL, PORTRAIT_SQUARE, SITE_URL } from "@/lib/seo";
import { listPublic } from "@/server/repo";

export const revalidate = 3600;

/** Absolute URL for an image path (uploads and /public files are relative). */
const abs = (src?: string) => (!src ? undefined : /^https?:\/\//.test(src) ? src : `${SITE_URL}${src}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, projects] = await Promise.all([listPublic<BlogPost>("blogs", 500), listPublic<Project>("projects", 500)]);
  const at = (d?: string) => (d ? new Date(d) : new Date());
  return [
    // Image entries let Google Images associate the portrait with the name on this page.
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1, images: [PORTRAIT_SQUARE, PORTRAIT_FULL, OG_IMAGE] },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: at(p.updatedAt),
      priority: 0.7,
      ...(p.cover ? { images: [abs(p.cover)!] } : {}),
    })),
    ...blogs.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: at(b.updatedAt),
      priority: 0.6,
      ...(b.cover ? { images: [abs(b.cover)!] } : {}),
    })),
  ];
}
