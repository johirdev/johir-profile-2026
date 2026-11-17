import "server-only";
import { z } from "zod";
import type { Field } from "@/content/schema";

/** http(s) URLs, site-relative paths, mailto/tel — never javascript:/data: */
const SAFE_URL = /^(https?:\/\/[^\s<>"']+|\/(?!\/)[^\s<>"']*|mailto:[^\s<>"']+|tel:[+\d\s-]+)$/i;
const ICON_KEY = /^[a-z0-9-]{1,40}$/;
const HEX = /^#[0-9a-f]{6}$/i;

/** Strip ASCII control characters (keeps \n and \t) and trim. */
export const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const str = (max = 300) => z.string().max(max).transform(clean);

function fieldSchema(f: Field): z.ZodType {
  const max = f.max ?? (f.type === "markdown" ? 60000 : f.type === "textarea" ? 2000 : 300);
  let s: z.ZodType;

  switch (f.type) {
    case "text":
    case "textarea":
    case "markdown":
      s = f.required ? str(max).pipe(z.string().min(1, `${f.label} is required`)) : str(max);
      break;
    case "url":
    case "image":
    case "file":
      s = str(2048).refine((v) => v === "" || SAFE_URL.test(v), `${f.label} must be an http(s) URL or a /path`);
      if (f.required) s = s.refine((v) => v !== "", `${f.label} is required`);
      break;
    case "number": {
      let n = z.coerce.number();
      if (f.min !== undefined) n = n.min(f.min);
      if (f.max !== undefined) n = n.max(f.max);
      s = f.required ? n : n.optional();
      break;
    }
    case "boolean":
      s = z.boolean().default(false);
      break;
    case "select": {
      const opts = (f.options ?? []) as [string, ...string[]];
      s = f.required ? z.enum(opts) : z.union([z.enum(opts), z.literal("")]);
      break;
    }
    case "color":
      s = z.string().refine((v) => v === "" || HEX.test(v), "Use a #rrggbb colour");
      break;
    case "tags":
      s = z.array(str(40).pipe(z.string().min(1))).max(30);
      break;
    case "lines":
      s = z.array(str(500)).max(40).transform((a) => a.filter(Boolean));
      break;
    case "icon":
      s = z.string().refine((v) => v === "" || ICON_KEY.test(v), "Invalid icon");
      break;
    case "icons":
      s = z.array(z.string().regex(ICON_KEY)).max(60);
      break;
    case "list":
      s = z.array(objectSchema(f.fields ?? [])).max(60);
      break;
  }

  // Missing optional fields default to an empty value so documents stay uniform.
  if (!f.required && f.type !== "boolean" && f.type !== "number") {
    const empty = ["tags", "lines", "icons", "list"].includes(f.type) ? [] : "";
    s = s.optional().transform((v) => (v === undefined ? empty : v));
  }
  return s;
}

export function objectSchema(fields: Field[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  return z.object(shape); // unknown keys are stripped
}

export function formatZodError(err: z.ZodError) {
  const first = err.issues[0];
  if (!first) return "Invalid input";
  const path = first.path.join(".");
  return path ? `${path}: ${first.message}` : first.message;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "item";

export const isObjectId = (id: string) => /^[0-9a-f]{24}$/i.test(id);

export const readMinutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).length / 220));
