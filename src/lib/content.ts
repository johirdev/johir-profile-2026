/**
 * Read-only content lookups for the SEO surfaces (sitemap.xml, feed.xml).
 *
 * Every call degrades to an empty list instead of throwing: a database that
 * is unreachable during `next build` should cost us the dynamic URLs, not
 * the whole deploy.
 */

export interface ContentEntry {
  id: string;
  title: string;
  description: string;
  image?: string;
  updatedAt: Date;
  createdAt: Date;
}

const toDate = (value: unknown, fallback: Date): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
};

async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;

  try {
    return await run();
  } catch (error) {
    console.warn(
      `[seo] ${label} lookup failed, falling back to static entries:`,
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}

export async function getBlogEntries(limit = 500): Promise<ContentEntry[]> {
  return safeQuery(
    "blog",
    async () => {
      const { connectDB } = await import("@/app/lib/db");
      const { BlogModel } = await import("@/app/models/blog.model");

      await connectDB();
      const docs = await BlogModel.find()
        .select("title excerpt cover_image createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const now = new Date();
      return docs.map((doc) => {
        const created = toDate((doc as { createdAt?: unknown }).createdAt, now);
        return {
          id: String(doc._id),
          title: String(doc.title ?? ""),
          description: String(doc.excerpt ?? ""),
          image: doc.cover_image ? String(doc.cover_image) : undefined,
          createdAt: created,
          updatedAt: toDate((doc as { updatedAt?: unknown }).updatedAt, created),
        };
      });
    },
    []
  );
}

export async function getProjectEntries(limit = 500): Promise<ContentEntry[]> {
  return safeQuery(
    "project",
    async () => {
      const { connectDB } = await import("@/app/lib/db");
      const { ProjectModel } = await import("@/app/models/portfolio.model");

      await connectDB();
      const docs = await ProjectModel.find()
        .select("title summary cover_image createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const now = new Date();
      return docs.map((doc) => {
        const created = toDate((doc as { createdAt?: unknown }).createdAt, now);
        return {
          id: String(doc._id),
          title: String(doc.title ?? ""),
          description: String(doc.summary ?? ""),
          image: doc.cover_image ? String(doc.cover_image) : undefined,
          createdAt: created,
          updatedAt: toDate((doc as { updatedAt?: unknown }).updatedAt, created),
        };
      });
    },
    []
  );
}

/** Looks up one record by Mongo id, for `generateMetadata` on the detail routes. */
async function findById(
  collection: "blog" | "project",
  id: string
): Promise<ContentEntry | null> {
  // Reject anything that is not a 24-char hex ObjectId before touching the DB.
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;

  return safeQuery(
    `${collection}:${id}`,
    async () => {
      const { connectDB } = await import("@/app/lib/db");
      await connectDB();

      const now = new Date();

      if (collection === "blog") {
        const { BlogModel } = await import("@/app/models/blog.model");
        const doc = await BlogModel.findById(id)
          .select("title excerpt cover_image createdAt updatedAt")
          .lean();
        if (!doc) return null;

        const created = toDate((doc as { createdAt?: unknown }).createdAt, now);
        return {
          id: String(doc._id),
          title: String(doc.title ?? ""),
          description: String(doc.excerpt ?? ""),
          image: doc.cover_image ? String(doc.cover_image) : undefined,
          createdAt: created,
          updatedAt: toDate((doc as { updatedAt?: unknown }).updatedAt, created),
        };
      }

      const { ProjectModel } = await import("@/app/models/portfolio.model");
      const doc = await ProjectModel.findById(id)
        .select("title summary cover_image createdAt updatedAt")
        .lean();
      if (!doc) return null;

      const created = toDate((doc as { createdAt?: unknown }).createdAt, now);
      return {
        id: String(doc._id),
        title: String(doc.title ?? ""),
        description: String(doc.summary ?? ""),
        image: doc.cover_image ? String(doc.cover_image) : undefined,
        createdAt: created,
        updatedAt: toDate((doc as { updatedAt?: unknown }).updatedAt, created),
      };
    },
    null
  );
}

export const getBlogById = (id: string) => findById("blog", id);
export const getProjectById = (id: string) => findById("project", id);

/** Trims a description to a length search engines will actually render. */
export const clampDescription = (text: string, max = 160) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:—-]+\S*$/, "")}…`;
};
