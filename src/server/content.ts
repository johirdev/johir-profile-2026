import "server-only";
import { COLLECTIONS, type CollectionDef, type CollectionKey } from "@/content/schema";
import { contentModel } from "./models";
import { HttpError } from "./security";
import { formatZodError, objectSchema, slugify } from "./validation";

/** Validates admin input for a collection and applies derived fields. */
export async function prepareWrite(
  key: CollectionKey,
  input: unknown,
  { partial = false, id }: { partial?: boolean; id?: string } = {},
) {
  const def = COLLECTIONS[key] as CollectionDef;
  let schema = objectSchema(def.fields);
  if (partial && input && typeof input === "object") {
    // Only validate the keys that were sent (e.g. a "published" toggle).
    const sent = new Set(Object.keys(input));
    schema = objectSchema(def.fields.filter((f) => sent.has(f.name)));
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new HttpError(400, formatZodError(parsed.error));
  const data = parsed.data as Record<string, unknown>;

  if (def.slugFrom && !partial) {
    const base = slugify(String(data.slug || data[def.slugFrom] || ""));
    data.slug = await uniqueSlug(key, base, id);
  }
  return data;
}

async function uniqueSlug(key: CollectionKey, base: string, id?: string) {
  const Model = contentModel(key);
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const clash = await Model.findOne({ slug, ...(id ? { _id: { $ne: id } } : {}) }).select("_id").lean();
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Only one resume may be active; activating one deactivates the rest. */
export async function afterWrite(key: CollectionKey, id: string, data: Record<string, unknown>) {
  if (key === "resumes" && data.active === true) {
    await contentModel("resumes").updateMany({ _id: { $ne: id } }, { $set: { active: false } });
  }
}
