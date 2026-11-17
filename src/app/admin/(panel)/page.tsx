import Link from "next/link";
import { ArrowUpRight, BookOpen, FolderKanban, Inbox, MessageSquareQuote, Sparkles, Wand2 } from "lucide-react";
import { COLLECTIONS, type CollectionKey } from "@/content/schema";
import { getSession } from "@/server/auth";
import { counts, listAll } from "@/server/repo";

export default async function Dashboard() {
  const session = await getSession();
  let stats: Record<string, number> = {};
  let messages: Record<string, unknown>[] = [];
  let dbError = "";
  try {
    [stats, messages] = await Promise.all([counts(), listAll("messages")]);
  } catch (e) {
    dbError = (e as Error).message;
  }

  const cards: { key: CollectionKey; icon: typeof Inbox; extra?: string }[] = [
    { key: "messages", icon: Inbox, extra: stats.unread ? `${stats.unread} unread` : undefined },
    { key: "projects", icon: FolderKanban },
    { key: "blogs", icon: BookOpen },
    { key: "reviews", icon: MessageSquareQuote, extra: stats.pendingReviews ? `${stats.pendingReviews} awaiting approval` : undefined },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="panel relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Hello, {session?.name.split(" ")[0]} 👋</h1>
        <p className="mt-2 max-w-2xl text-soft">Every section of the portfolio is editable here. Changes go live the moment you save.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/admin/settings/hero" className="btn-primary !py-2.5"><Sparkles className="h-4 w-4" /> Edit hero banner</Link>
          <Link href="/admin/c/blogs/new" className="btn-ghost !py-2.5"><Wand2 className="h-4 w-4" /> Write a post with AI</Link>
          <Link href="/admin/c/projects/new" className="btn-ghost !py-2.5"><FolderKanban className="h-4 w-4" /> Add a project</Link>
        </div>
      </div>

      {dbError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">Database error: {dbError}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.key} href={`/admin/c/${c.key}`} className="panel panel-hover group p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-elev"><c.icon className="h-5 w-5 text-accent" /></span>
              <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:rotate-45" />
            </div>
            <p className="mt-4 text-3xl font-bold">{stats[c.key] ?? "–"}</p>
            <p className="text-sm text-soft">{COLLECTIONS[c.key].label}</p>
            {c.extra && <p className="mt-1 text-xs font-medium text-accent-ink">{c.extra}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Latest messages</h2>
            <Link href="/admin/c/messages" className="text-sm text-soft hover:text-fg">View all</Link>
          </div>
          {messages.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No messages yet.</p>
          ) : (
            <ul className="divide-y">
              {messages.slice(0, 6).map((m) => (
                <li key={String(m._id)}>
                  <Link href={`/admin/c/messages/${m._id}`} className="flex gap-3 p-4 hover:bg-elev/60">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.status === "New" ? "bg-accent" : "bg-transparent"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{String(m.name)} <span className="font-normal text-muted">· {String(m.subject ?? "")}</span></span>
                        <span className="shrink-0 text-xs text-muted">{new Date(String(m.createdAt)).toLocaleDateString()}</span>
                      </span>
                      <span className="line-clamp-1 text-sm text-soft">{String(m.message ?? "")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 font-semibold">All sections</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {(Object.keys(COLLECTIONS) as CollectionKey[]).map((k) => (
              <li key={k}>
                <Link href={`/admin/c/${k}`} className="flex items-center justify-between rounded-lg border px-3 py-2 hover:border-accent/50">
                  <span className="truncate">{COLLECTIONS[k].label}</span>
                  <span className="font-mono text-xs text-muted">{stats[k] ?? "–"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
