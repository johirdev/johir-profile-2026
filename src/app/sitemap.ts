import type { MetadataRoute } from "next";
import { SITE_URL, OG_IMAGE } from "@/lib/seo";
import { getBlogEntries, getProjectEntries } from "@/lib/content";

/** Rebuild the sitemap hourly rather than freezing it at build time. */
export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/start-a-project", changeFrequency: "monthly", priority: 0.9 },
  { path: "/qualifications", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Both lists resolve to [] if the database is unreachable, so a build
  // without DATABASE_URL still emits a valid sitemap of the static routes.
  const [blogs, projects] = await Promise.all([
    getBlogEntries(),
    getProjectEntries(),
  ]);

  const newestOf = (dates: Date[]) =>
    dates.length
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : now;

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    // The home page carries the blog and project sections, so its freshness
    // is the newest of anything published.
    lastModified:
      route.path === "/"
        ? newestOf([
            ...blogs.map((b) => b.updatedAt),
            ...projects.map((p) => p.updatedAt),
          ])
        : now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.path === "/" ? { images: [OG_IMAGE] } : {}),
  }));

  const blogEntries: MetadataRoute.Sitemap = blogs.map((post) => ({
    url: `${SITE_URL}/blog/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
    ...(post.image ? { images: [post.image] } : {}),
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/project/${project.id}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
    ...(project.image ? { images: [project.image] } : {}),
  }));

  return [...staticEntries, ...projectEntries, ...blogEntries];
}
