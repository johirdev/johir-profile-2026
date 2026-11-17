"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { COLLECTIONS, type CollectionDef, type CollectionKey } from "@/content/schema";
import { TechIcon } from "@/lib/icons";
import { api } from "./api";
import Confirm from "./Confirm";

type Row = Record<string, unknown> & { _id: string };

const STATUS_TONE: Record<string, string> = {
  New: "bg-accent/15 text-accent-ink",
  Read: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  Replied: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Archived: "bg-zinc-500/15 text-muted",
};

export default function CollectionList({ collection }: { collection: CollectionKey }) {
  const def = COLLECTIONS[collection] as CollectionDef;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [del, setDel] = useState<Row | null>(null);
  const isInbox = collection === "messages";
  const canCreate = !isInbox;

  const load = useCallback(() => {
    api<Row[]>(`/api/content/${collection}`)
      .then(setRows)
      .catch((e) => {
        toast.error(e.message);
        setRows([]);
      });
  }, [collection]);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s)) : rows;
  }, [rows, q]);

  const patch = async (row: Row, body: Record<string, unknown>) => {
    setRows((rs) => rs?.map((r) => (r._id === row._id ? { ...r, ...body } : r)) ?? rs);
    try {
      await api(`/api/content/${collection}/${row._id}`, { method: "PATCH", body });
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const remove = async () => {
    if (!del) return;
    try {
      await api(`/api/content/${collection}/${del._id}`, { method: "DELETE" });
      setRows((rs) => rs?.filter((r) => r._id !== del._id) ?? rs);
      toast.success("Deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setDel(null);
  };

  const fmt = (d: unknown) => (d ? new Date(String(d)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "");
  const thumbField = def.fields.find((f) => f.type === "image");
  const iconField = def.fields.find((f) => f.type === "icon");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{def.label}</h1>
          <p className="mt-1 text-sm text-soft">{def.description}</p>
        </div>
        {canCreate && (
          <Link href={`/admin/c/${collection}/new`} className="btn-accent !py-2.5">
            <Plus className="h-4 w-4" /> New {def.singular.toLowerCase()}
          </Link>
        )}
      </div>

      <label className="mb-4 flex items-center gap-2 rounded-xl border bg-card px-3">
        <Search className="h-4 w-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}…`} className="w-full bg-transparent py-2.5 text-sm outline-none" />
        {rows && <span className="shrink-0 font-mono text-xs text-muted">{filtered.length}</span>}
      </label>

      {!rows ? (
        <Loader2 className="mx-auto mt-16 h-6 w-6 animate-spin text-muted" />
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center text-soft">
          {isInbox ? "No messages yet." : `No ${def.label.toLowerCase()} yet.`}
          {canCreate && (
            <Link href={`/admin/c/${collection}/new`} className="ml-1 font-medium text-accent-ink underline">Create one</Link>
          )}
        </div>
      ) : (
        <ul className="panel divide-y overflow-hidden">
          {filtered.map((r) => {
            const pub = def.publishField ? Boolean(r[def.publishField]) : true;
            const thumb = thumbField ? String(r[thumbField.name] ?? "") : "";
            return (
              <li key={r._id} className={`group flex items-center gap-3 p-3 transition hover:bg-elev/60 sm:p-4 ${!pub ? "opacity-70" : ""}`}>
                <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border bg-elev">
                  {isInbox ? (
                    <Mail className="h-4 w-4 text-muted" />
                  ) : thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : iconField && r[iconField.name] ? (
                    <TechIcon name={String(r[iconField.name])} className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold text-muted">{String(r[def.titleField] ?? "?").slice(0, 2)}</span>
                  )}
                </div>
                <Link href={`/admin/c/${collection}/${r._id}`} className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-medium">
                    {String(r[def.titleField] ?? "Untitled")}
                    {Boolean(r.featured) && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                    {Boolean(r.active) && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">ACTIVE</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {def.subtitleField && String(r[def.subtitleField] ?? "")}
                    {isInbox && ` · ${String(r.email ?? "")}`}
                    {" · "}
                    {fmt(r.updatedAt ?? r.createdAt)}
                  </p>
                  {isInbox && <p className="mt-1 line-clamp-1 text-sm text-soft">{String(r.message ?? "")}</p>}
                </Link>

                {isInbox && (
                  <select
                    value={String(r.status ?? "New")}
                    onChange={(e) => patch(r, { status: e.target.value })}
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${STATUS_TONE[String(r.status ?? "New")] ?? ""}`}
                  >
                    {["New", "Read", "Replied", "Archived"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                )}
                {def.publishField && (
                  <button
                    onClick={() => patch(r, { [def.publishField!]: !pub })}
                    title={pub ? "Visible — click to hide" : "Hidden — click to publish"}
                    className={`grid h-9 w-9 place-items-center rounded-lg border transition ${pub ? "text-emerald-500" : "text-muted"}`}
                  >
                    {pub ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                )}
                <Link href={`/admin/c/${collection}/${r._id}`} className="hidden h-9 w-9 place-items-center rounded-lg border text-soft hover:text-fg sm:grid" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => setDel(r)} className="grid h-9 w-9 place-items-center rounded-lg border text-soft hover:border-red-500/50 hover:text-red-500" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {del && (
        <Confirm
          title={`Delete “${String(del[def.titleField] ?? def.singular)}”?`}
          body="It disappears from the site immediately. This can't be undone."
          onConfirm={remove}
          onClose={() => setDel(null)}
        />
      )}
    </div>
  );
}
