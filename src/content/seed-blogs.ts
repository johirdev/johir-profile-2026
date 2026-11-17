/* Seed articles. Markdown extensions supported by the renderer:
     ==text==                 → highlighted
     {color:#ff6333}text{/color} → coloured text
     > [!TIP] / [!NOTE] / [!WARNING] → callout blocks */

export const SEED_BLOGS = [
  {
    subject: "AI revolution for software engineers",
    title: "The AI Revolution Isn't Replacing Engineers — It's Raising the Bar",
    slug: "ai-revolution-raising-the-bar-for-engineers",
    excerpt: "AI writes code in seconds now. Here's what that actually changes about a software engineer's job — and the skills that matter more than ever.",
    tags: ["AI", "Career", "Claude Code"],
    accent: "#a78bfa",
    featured: true,
    published: true,
    content: `Two years ago, "AI pair programmer" meant autocomplete that guessed the next line. Today I hand Claude Code a ticket and it reads the codebase, edits six files, runs the tests and explains what it changed. That's not a better autocomplete. ==That's a different job.==

So is the software engineer finished? In my experience — no. But the *shape* of the job is changing fast, and the engineers who notice early will have an enormous advantage.

## What AI is genuinely great at

Let's be honest about where the tools already beat me on speed:

- **Boilerplate and glue code** — CRUD endpoints, form wiring, DTOs, migrations.
- **First drafts of tests** — especially table-driven tests in Go.
- **Reading unfamiliar code** — "explain how auth flows through this repo" saves an afternoon.
- **Translating** — a Python script into Go, a REST client into a typed SDK.

Each of these used to cost hours. Now they cost minutes plus a careful review.

## What it is still bad at

> [!WARNING]
> AI is confidently wrong in exactly the places where mistakes are most expensive: security, data integrity and system boundaries.

A model will happily write an endpoint that forgets authorisation, a migration that locks a production table, or a cache with no invalidation story. It doesn't *own* the system — it has never been paged at 3 a.m. because of it.

That ownership is the engineer's job, and it is becoming {color:#ff6333}**the** job{/color}.

## The skills that matter more now

### 1. Specifying problems precisely

The quality of AI output is capped by the quality of the request. Engineers who can write a clear spec — inputs, outputs, edge cases, constraints — get dramatically better results. Writing good tickets used to be a "senior" skill. Now everyone needs it.

### 2. Reviewing code fast and deeply

When code is cheap to produce, ==review becomes the bottleneck==. Reading a diff and spotting the missing null check, the N+1 query or the leaked secret is now one of the highest-leverage things you can do.

### 3. System design

AI can build a component. Deciding *which* components should exist, how they talk, where state lives and what happens when one fails — that is still human work, and it's where most real-world bugs are born.

### 4. Taste

Knowing when an interface feels right, when an API is pleasant to use, when a page is "fast enough". Taste comes from shipping things and watching real users. No model has done that for your product.

## How I actually work now

My loop for a typical feature looks like this:

1. Write a short spec in the ticket — behaviour, edge cases, acceptance criteria.
2. Let Claude Code draft the implementation and tests on a branch.
3. Review the diff line by line, as if a new teammate wrote it.
4. Run it, break it on purpose, then tighten the tests.
5. Ship behind a flag and watch the metrics.

> [!TIP]
> Treat AI output like a pull request from a very fast junior developer: helpful, often right, never merged without review.

## The bottom line

The AI revolution doesn't lower the bar for software engineers — it raises it. Typing code is becoming cheap. **Judgement, ownership and clear thinking** are becoming the product. That's good news for anyone willing to grow into it.`,
  },
  {
    subject: "Next.js performance and architecture",
    title: "Next.js in Production: Patterns I Use to Ship Fast, Scalable Apps",
    slug: "nextjs-production-patterns",
    excerpt: "Server Components, caching, images and route design — the practical Next.js patterns that keep my apps fast long after launch.",
    tags: ["Next.js", "React", "Performance"],
    accent: "#22d3ee",
    featured: false,
    published: true,
    content: `Next.js makes it easy to build something fast on day one. Keeping it fast on day three hundred — after forty features and five developers — takes a few deliberate habits. These are the ones I rely on.

## 1. Default to Server Components

In the App Router, every component is a Server Component unless you opt out. ==Keep it that way as long as you can.== Server Components ship zero JavaScript to the browser, can query the database directly and keep secrets on the server.

\`\`\`tsx
// app/projects/page.tsx — runs only on the server
export default async function Projects() {
  const projects = await db.project.findMany({ where: { published: true } });
  return <ProjectGrid projects={projects} />;
}
\`\`\`

Add \`"use client"\` only to the *leaves* that need interactivity — a filter bar, a modal, an animated hero — and pass them plain data as props.

> [!TIP]
> If a client component imports a heavy library, every page that renders it pays for it. Push \`"use client"\` as far down the tree as possible.

## 2. Decide your caching strategy per route

Every route should answer one question: **how fresh does this data need to be?**

| Content | Strategy |
| --- | --- |
| Marketing pages | Static, revalidate on deploy |
| Blog & portfolio | ISR — revalidate on a timer *and* on admin save |
| Dashboards | Dynamic, per request |

On-demand revalidation is the hidden superpower: when the admin saves a post, call \`revalidatePath()\` and the public page updates instantly — no rebuild.

## 3. Treat images as a performance budget

Images are usually the heaviest thing on the page. \`next/image\` handles responsive sizes, lazy loading and modern formats, but you still have to:

- set an accurate \`sizes\` attribute so phones don't download desktop images,
- mark only the true LCP image as \`priority\`,
- reserve space with width/height to avoid layout shift.

## 4. Validate at the boundary

Every Route Handler and Server Action is a public API endpoint — {color:#ff6333}**even if only your UI calls it**{/color}. I validate every input with a schema (Zod) and return typed errors:

\`\`\`ts
const Body = z.object({ email: z.string().email(), message: z.string().min(10).max(3000) });
const parsed = Body.safeParse(await req.json());
if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
\`\`\`

## 5. Measure what users feel

Lighthouse in CI is a start, but real-user Core Web Vitals (LCP, INP, CLS) tell the truth. I watch them after every release, and any regression gets a ticket the same day.

## Wrapping up

None of these are exotic. ==Server-first rendering, explicit caching, disciplined images, validated boundaries and real measurement== — applied consistently, they keep a Next.js app fast and pleasant to work on as it grows.`,
  },
  {
    subject: "Go backend engineering",
    title: "Why I Reach for Go When the Backend Has to Be Boring and Fast",
    slug: "go-backend-boring-and-fast",
    excerpt: "Go's simplicity is a feature. How I structure Gin APIs — handlers, services, errors and graceful shutdown — for services that just keep running.",
    tags: ["Go", "Backend", "API"],
    accent: "#22c55e",
    featured: false,
    published: true,
    content: `JavaScript is my first language and I still love Node.js. But when a service needs to handle real load, run for months without surprises and be easy for the next engineer to read, I reach for **Go**.

## Why Go

- **One binary, tiny containers.** No \`node_modules\`, no runtime to install.
- **Concurrency is built in.** Goroutines and channels make "do these five things in parallel" boring.
- **Predictable performance.** Low memory use and fast cold starts.
- **Simplicity.** There is usually one obvious way to do something — ==which makes code reviews faster.==

## The layout I use with Gin

\`\`\`text
cmd/api/main.go        → wiring & startup
internal/http/         → handlers, middleware, routes
internal/service/      → business logic
internal/store/        → database access
internal/domain/       → types & errors
\`\`\`

Handlers stay thin: parse, call a service, translate the result into HTTP.

\`\`\`go
func (h *OrderHandler) Get(c *gin.Context) {
    order, err := h.svc.Find(c.Request.Context(), c.Param("id"))
    if err != nil {
        h.writeError(c, err)
        return
    }
    c.JSON(http.StatusOK, order)
}
\`\`\`

## Errors as part of the design

Go makes you handle errors explicitly, so I make them meaningful. Domain errors are defined once and mapped to status codes in one place:

\`\`\`go
var ErrNotFound = errors.New("not found")

func (h *OrderHandler) writeError(c *gin.Context, err error) {
    switch {
    case errors.Is(err, domain.ErrNotFound):
        c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
    default:
        h.log.Error("unexpected", "err", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
    }
}
\`\`\`

> [!NOTE]
> Never leak raw database errors to clients. Log the detail, return a stable message.

## Context everywhere

Every request carries a \`context.Context\`. Pass it to the database, to HTTP clients, to everything. When a client disconnects or a timeout fires, ==all downstream work is cancelled automatically== — no wasted queries.

## Graceful shutdown

Deploys shouldn't drop requests. Listen for \`SIGTERM\`, stop accepting new connections and give in-flight requests time to finish:

\`\`\`go
srv := &http.Server{Addr: ":8080", Handler: router}
go srv.ListenAndServe()

<-ctx.Done() // signal received
shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(shutdownCtx)
\`\`\`

## The takeaway

Go isn't exciting, and {color:#22c55e}**that's exactly the point**{/color}. A backend should be the least interesting part of your incident report. Thin handlers, explicit errors, context propagation and graceful shutdown get you most of the way there.`,
  },
  {
    subject: "AI automation with n8n and LLMs",
    title: "AI Automation in Practice: Building Workflows That Save Hours Every Week",
    slug: "ai-automation-workflows-n8n",
    excerpt: "From lead triage to content pipelines — how I combine n8n, LLMs and a human checkpoint to automate the boring parts of a business safely.",
    tags: ["AI Automation", "n8n", "LLM"],
    accent: "#ea4b71",
    featured: false,
    published: true,
    content: `Most businesses don't need a custom AI model. They need the ==twenty repetitive tasks== that eat their week to quietly disappear. That's where AI automation shines — and where tools like **n8n** paired with an LLM are incredibly effective.

## What makes a good automation candidate

I look for tasks that are:

1. **Frequent** — daily or weekly, not once a quarter.
2. **Rule-ish** — a human follows a rough checklist.
3. **Text-heavy** — emails, forms, documents, tickets.
4. **Low blast radius** — a mistake is annoying, not catastrophic.

Classic examples: triaging inbound leads, summarising support tickets, drafting first replies, tagging content and syncing data between tools.

## Anatomy of a workflow

Here's a lead-triage flow I like to build:

\`\`\`text
Webhook (form submit)
  → Validate & de-duplicate
  → LLM: classify intent + extract budget, timeline
  → IF high intent → Slack alert + CRM deal
  → ELSE → nurture email sequence
  → Log everything to a sheet
\`\`\`

The LLM step does what used to need a person reading every message: understand messy human text and turn it into ==structured fields.==

> [!TIP]
> Always ask the model for **structured output** (JSON matching a schema) instead of free text. It makes every downstream step reliable.

## Keep a human in the loop

Automation should *propose*, people should *approve* — at least at first. For anything customer-facing I add a review step:

- The AI drafts the reply.
- A teammate approves or edits it with one click.
- Only then is it sent.

Over time, categories with a near-perfect approval rate can graduate to fully automatic. {color:#ea4b71}**Trust is earned per workflow, not granted up front.**{/color}

## Guardrails I always add

> [!WARNING]
> LLMs can be prompt-injected. Treat everything inside an email or form as untrusted data, never as instructions.

- Validate every input before it reaches the model.
- Keep secrets and API keys out of prompts.
- Set limits on cost and run counts.
- Log inputs and outputs so you can audit decisions later.

## Measuring the win

Before automating, I time the manual task. After, I track runs, failures and approval rates. A workflow that saves **30 minutes a day** pays for itself within weeks — and frees people to do work that actually needs a human.

## Final thought

AI automation isn't about replacing your team. It's about ==removing the friction between them and their real work==. Start with one boring, frequent task, add a human checkpoint, measure it — then do the next one.`,
  },
];
