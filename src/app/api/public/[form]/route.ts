import type { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/server/db";
import { contentModel } from "@/server/models";
import { refreshSite } from "@/server/revalidate";
import { clean } from "@/server/validation";
import {
  clientIp, fail, formatIssue, handle, hashIp, isSameOrigin, looksMalicious, ok, rateLimit, readJson,
} from "./guard";

type Ctx = { params: Promise<{ form: string }> };

const text = (min: number, max: number) => z.string().transform(clean).pipe(z.string().min(min).max(max));
const NAME = /^[\p{L}\p{M} .'-]+$/u;

const Contact = z.object({
  name: text(2, 80).refine((v) => NAME.test(v), "Name can only contain letters, spaces, . ' -"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  subject: z.enum(["Full-time role", "Freelance project", "Consulting", "Collaboration", "Just saying hi"]),
  budget: z.enum(["Not sure yet", "< $1k", "$1k – $5k", "$5k – $15k", "$15k+"]).optional(),
  message: text(20, 3000),
});

const Feedback = z.object({
  name: text(2, 80).refine((v) => NAME.test(v), "Name can only contain letters, spaces, . ' -"),
  role: text(0, 80).optional(),
  company: text(0, 80).optional(),
  country: text(0, 60).optional(),
  project: text(0, 120).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  quote: text(30, 900),
});

const FORMS = {
  contact: { schema: Contact, collection: "messages" as const, perDay: 5 },
  feedback: { schema: Feedback, collection: "reviews" as const, perDay: 2 },
};

/**
 * Defence in depth for anonymous submissions:
 *  same-origin check → body size cap → per-IP burst limit → honeypot →
 *  minimum fill time → strict schema (enum fields, length caps, charset) →
 *  markup / injection pattern rejection → link-count cap → per-IP daily cap.
 * Stored as plain text and rendered escaped by React — never as HTML.
 */
export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const { form } = await params;
  const cfg = FORMS[form as keyof typeof FORMS];
  if (!cfg) return fail("Not found", 404);
  if (!isSameOrigin(req)) return fail("Cross-site request blocked", 403);

  const ip = clientIp(req);
  const burst = rateLimit(`${form}:${ip}`, 3, 10 * 60 * 1000);
  if (!burst.ok) return fail("You're sending too fast — please wait a few minutes", 429, { "Retry-After": String(burst.retryAfter) });

  const body = await readJson<Record<string, unknown>>(req, 12_000);

  // Bots fill every field; humans never see this one.
  if (typeof body.website === "string" && body.website.length > 0) return ok({ received: true });
  // Humans need more than ~3 seconds to fill the form.
  const elapsed = Number(body.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < 3000) return fail("Please take a moment to fill in the form");

  const parsed = cfg.schema.safeParse(body);
  if (!parsed.success) return fail(formatIssue(parsed.error));
  const data = parsed.data as Record<string, unknown>;

  const strings = Object.values(data).filter((v): v is string => typeof v === "string");
  if (strings.some(looksMalicious)) return fail("Your message contains content we can't accept (HTML, scripts or code injection).");
  const body_ = String(data.message ?? data.quote ?? "");
  if ((body_.match(/https?:\/\/|www\./gi) ?? []).length > 2) return fail("Please include at most two links");

  await connectDB();
  const Model = contentModel(cfg.collection);
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if ((await Model.countDocuments({ ipHash, createdAt: { $gte: since } })) >= cfg.perDay) {
    return fail("Daily limit reached — thank you, I'll get back to you soon.", 429);
  }

  const extra =
    cfg.collection === "messages"
      ? { status: "New", budget: data.budget ?? "" }
      : { published: false, featured: false, avatar: "" };
  await Model.create({ ...data, ...extra, ipHash, userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200) });
  if (cfg.collection === "reviews") refreshSite();
  return ok({ received: true }, 201);
});
