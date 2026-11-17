import "server-only";
import { cache } from "react";
import mongoose from "mongoose";
import {
  COLLECTIONS,
  type CollectionDef,
  type CollectionKey,
  type Doc,
  type SettingKey,
  type SettingsMap,
} from "@/content/schema";
import { DEFAULT_COLLECTIONS, DEFAULT_SETTINGS } from "@/content/defaults";
import { ICONS } from "@/lib/icons";
import { connectDB, hasDatabase } from "./db";
import { contentModel, SettingModel } from "./models";
import { readMinutes, slugify } from "./validation";

const PRIVATE_KEYS = new Set(["__v", "ipHash", "userAgent"]);

/** Mongo document → plain JSON-safe object for React props. */
export function serialize<T = Doc>(raw: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (PRIVATE_KEYS.has(k)) continue;
    if (k === "_id") out._id = String(v);
    else if (v instanceof Date) out[k] = v.toISOString();
    else if (v && typeof v === "object" && "_bsontype" in (v as object)) out[k] = String(v);
    else out[k] = v;
  }
  return out as T;
}

function withDefaultsIds(key: CollectionKey): Doc[] {
  return (DEFAULT_COLLECTIONS[key] ?? []).map((row, i) => decorate(key, { _id: `default-${key}-${i}`, ...row }));
}

/** Derived fields computed on read. */
function decorate(key: CollectionKey, doc: Doc): Doc {
  if (key === "blogs" && typeof doc.content === "string") {
    doc.readMinutes = readMinutes(doc.content);
  }
  return doc;
}

/* ───────────────────────── Seeding ───────────────────────── */

const seeding = new Map<string, Promise<void>>();

async function legacyRows(key: CollectionKey): Promise<Record<string, unknown>[]> {
  const db = mongoose.connection.db;
  if (!db) return [];
  const pull = async (name: string) => {
    try {
      return await db.collection(name).find({}).limit(200).toArray();
    } catch {
      return [];
    }
  };
  const iconFor = (name: string) => {
    const k = slugify(name).replace(/-?js$/, "js").replace(/^node-?js$/, "nodejs");
    return ICONS[k] ? k : Object.keys(ICONS).find((i) => ICONS[i].label.toLowerCase() === name.toLowerCase());
  };

  if (key === "reviews") {
    return (await pull("reviews")).map((r) => ({
      name: r.reviewer_name ?? "Client",
      role: r.reviewer_role ?? "",
      avatar: r.reviewer_image ?? "",
      rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
      quote: r.review_text ?? "",
      company: r.badge_label ?? "",
      featured: false,
      published: true,
    })).filter((r) => r.quote);
  }
  if (key === "blogs") {
    return (await pull("blogs")).map((b) => ({
      subject: b.category ?? "Engineering",
      title: b.title,
      slug: b.slug || slugify(String(b.title ?? "post")),
      excerpt: b.excerpt ?? "",
      cover: b.cover_image ?? "",
      content: b.content ?? "",
      tags: Array.isArray(b.tags) ? b.tags : [],
      published: true,
      featured: false,
      createdAt: b.createdAt,
    })).filter((b) => b.title && b.content);
  }
  if (key === "projects") {
    return (await pull("projects")).map((p, i) => ({
      title: p.title,
      slug: slugify(String(p.title ?? `project-${i}`)),
      category: "Web App",
      status: "Live",
      summary: p.summary ?? "",
      problem: p.problem_statement ?? "",
      solution: p.description ?? "",
      client: p.client_name ?? "",
      cover: p.cover_image ?? "",
      gallery: [p.image_2, p.image_3].filter(Boolean).map((image) => ({ image, caption: "" })),
      stack: (Array.isArray(p.tech_stack) ? p.tech_stack : [])
        .map((t: { name?: string }) => (t?.name ? iconFor(t.name) : undefined))
        .filter(Boolean),
      liveUrl: p.live_url ?? "",
      repoUrl: p.github_url ?? "",
      featured: Boolean(p.featured),
      published: true,
      order: 20 + i,
    })).filter((p) => p.title && p.summary);
  }
  return [];
}

async function seedCollection(key: CollectionKey) {
  const flag = `__seeded:${key}`;
  const done = await SettingModel.exists({ key: flag });
  if (done) return;
  const Model = contentModel(key);
  if ((await Model.estimatedDocumentCount()) === 0) {
    const legacy = await legacyRows(key);
    const defaults = (DEFAULT_COLLECTIONS[key] ?? []) as Record<string, unknown>[];
    // Legacy rows win; a default with the same slug or the same live host is merged into it.
    const host = (u: unknown) => {
      try {
        return new URL(String(u)).host.replace(/^www\./, "");
      } catch {
        return "";
      }
    };
    const rows = [...legacy];
    for (const d of defaults) {
      const twin = rows.find((r) => (d.slug && r.slug === d.slug) || (host(d.liveUrl) && host(r.liveUrl) === host(d.liveUrl)));
      if (!twin) rows.push(d);
      else for (const [k, v] of Object.entries(d)) if (!["title", "slug", "summary", "cover"].includes(k) && v !== "" && !(Array.isArray(v) && !v.length)) twin[k] = v;
    }
    if (rows.length) await Model.insertMany(rows, { ordered: false }).catch(() => undefined);
  }
  await SettingModel.updateOne({ key: flag }, { $set: { value: { at: new Date() } } }, { upsert: true });
}

async function ensureSeeded(key: CollectionKey) {
  if (!seeding.has(key)) {
    seeding.set(key, seedCollection(key).catch((e) => {
      seeding.delete(key);
      throw e;
    }));
  }
  return seeding.get(key);
}

/* ───────────────────────── Reads ───────────────────────── */

const SORT = { order: 1, createdAt: -1 } as const;

async function safe<T>(label: string, run: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!hasDatabase()) return fallback();
  try {
    await connectDB();
    return await run();
  } catch (err) {
    console.warn(`[repo] ${label} failed — serving defaults:`, (err as Error).message);
    return fallback();
  }
}

const publishFilter = (def: CollectionDef) => (def.publishField ? { [def.publishField]: true } : {});

/** Public list: published rows only, sorted. Cached for the request. */
export const listPublic = cache(async <T extends Doc = Doc>(key: CollectionKey, limit = 200): Promise<T[]> => {
  const def = COLLECTIONS[key] as CollectionDef;
  return safe(
    `list ${key}`,
    async () => {
      await ensureSeeded(key);
      const docs = await contentModel(key).find(publishFilter(def)).sort(SORT).limit(limit).lean();
      return docs.map((d) => decorate(key, serialize(d)) as T);
    },
    () =>
      withDefaultsIds(key)
        .filter((d) => !def.publishField || d[def.publishField])
        .slice(0, limit) as T[],
  );
});

export const findPublicBySlug = cache(async <T extends Doc = Doc>(key: "blogs" | "projects", slug: string) => {
  if (!/^[a-z0-9-]{1,160}$/.test(slug)) return null;
  return safe<T | null>(
    `find ${key}/${slug}`,
    async () => {
      await ensureSeeded(key);
      const doc = await contentModel(key).findOne({ slug, published: true }).lean();
      return doc ? (decorate(key, serialize(doc)) as T) : null;
    },
    () => (withDefaultsIds(key).find((d) => d.slug === slug) as T) ?? null,
  );
});

export const getSetting = cache(async <K extends SettingKey>(key: K): Promise<SettingsMap[K]> => {
  const fallback = DEFAULT_SETTINGS[key] as SettingsMap[K];
  return safe(
    `setting ${key}`,
    async () => {
      const doc = await SettingModel.findOne({ key }).lean();
      if (!doc) {
        await SettingModel.updateOne({ key }, { $setOnInsert: { value: fallback } }, { upsert: true });
        return fallback;
      }
      return { ...fallback, ...(doc.value as object) } as SettingsMap[K];
    },
    () => fallback,
  );
});

/* ───────────────────────── Admin ───────────────────────── */

export async function listAll(key: CollectionKey) {
  await connectDB();
  await ensureSeeded(key);
  const sort = key === "messages" ? { createdAt: -1 as const } : SORT;
  const docs = await contentModel(key).find({}).sort(sort).limit(1000).lean();
  return docs.map((d) => serialize(d));
}

export async function counts() {
  await connectDB();
  const entries = await Promise.all(
    (Object.keys(COLLECTIONS) as CollectionKey[]).map(async (k) => {
      await ensureSeeded(k);
      return [k, await contentModel(k).countDocuments()] as const;
    }),
  );
  const unread = await contentModel("messages").countDocuments({ status: "New" });
  const pendingReviews = await contentModel("reviews").countDocuments({ published: false });
  return { ...Object.fromEntries(entries), unread, pendingReviews } as Record<string, number>;
}
