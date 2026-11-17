"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { COLLECTIONS, type CollectionDef, type CollectionKey } from "@/content/schema";
import { api } from "./api";
import Confirm from "./Confirm";
import FieldInput, { emptyRecord } from "./FieldInput";

type Rec = Record<string, unknown>;

export default function RecordEditor({ collection, id }: { collection: CollectionKey; id: string }) {
  const def = COLLECTIONS[collection] as CollectionDef;
  const isNew = id === "new";
  const router = useRouter();
  const [data, setData] = useState<Rec>(() => emptyRecord(def.fields));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api<Rec>(`/api/content/${collection}/${id}`)
      .then((d) => setData({ ...emptyRecord(def.fields), ...d }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [collection, id, isNew, def.fields]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = (k: string, v: unknown) => {
    setData((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const body = Object.fromEntries(def.fields.map((f) => [f.name, data[f.name]]));
      const saved = await api<Rec>(isNew ? `/api/content/${collection}` : `/api/content/${collection}/${id}`, {
        method: isNew ? "POST" : "PUT",
        body,
      });
      setDirty(false);
      toast.success(isNew ? `${def.singular} created` : "Saved — live on the site");
      if (isNew) router.replace(`/admin/c/${collection}/${saved._id}`);
      else setData((d) => ({ ...d, ...saved }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ⌘/Ctrl + S saves.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const remove = async () => {
    try {
      await api(`/api/content/${collection}/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      router.replace(`/admin/c/${collection}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const publicUrl =
    !isNew && data.slug ? (collection === "blogs" ? `/blog/${data.slug}` : collection === "projects" ? `/projects/${data.slug}` : null) : null;

  if (loading) return <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-muted" />;

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl">
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b bg-bg/85 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <Link href={`/admin/c/${collection}`} className="grid h-9 w-9 place-items-center rounded-full border hover:bg-elev" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{def.label}</p>
          <h1 className="truncate font-semibold">{isNew ? `New ${def.singular.toLowerCase()}` : String(data[def.titleField] || def.singular)}</h1>
        </div>
        {dirty && <span className="hidden text-xs text-amber-500 sm:inline">Unsaved changes</span>}
        {publicUrl && (
          <a href={publicUrl} target="_blank" rel="noopener" className="btn-ghost !px-3 !py-2" aria-label="View on site">
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {!isNew && (
          <button type="button" onClick={() => setConfirm(true)} className="btn-ghost !px-3 !py-2 hover:!border-red-500/50 hover:text-red-500" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-accent !py-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </div>

      {collection === "blogs" && <AiWriter subject={String(data.subject ?? "")} onSubject={(v) => set("subject", v)} onDraft={(d) => {
        setData((cur) => ({ ...cur, ...d, tags: d.tags }));
        setDirty(true);
      }} />}

      <div className="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
        {def.fields
          .filter((f) => !(collection === "blogs" && f.name === "subject"))
          .map((f) => (
            <FieldInput key={f.name} field={f} value={data[f.name]} onChange={(v) => set(f.name, v)} />
          ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">Tip: press Ctrl/⌘ + S to save.</p>

      {confirm && (
        <Confirm
          title={`Delete this ${def.singular.toLowerCase()}?`}
          body="This removes it from the site immediately and can't be undone."
          onConfirm={remove}
          onClose={() => setConfirm(false)}
        />
      )}
    </form>
  );
}

function AiWriter({
  subject,
  onSubject,
  onDraft,
}: {
  subject: string;
  onSubject: (v: string) => void;
  onDraft: (d: { title: string; excerpt: string; content: string; tags: string[] }) => void;
}) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (subject.trim().length < 4) {
      toast.error("Write a subject first");
      return;
    }
    setBusy(true);
    const t = toast.loading("Claude is drafting your article… (about a minute)");
    try {
      const d = await api<{ title: string; excerpt: string; content: string; tags: string[] }>("/api/ai/blog", {
        method: "POST",
        body: { subject, notes: notes || undefined },
      });
      onDraft(d);
      toast.success("Draft ready — review, edit and save", { id: t });
    } catch (e) {
      toast.error((e as Error).message, { id: t });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel relative mb-6 overflow-hidden p-5 sm:p-6">
      <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-500" />
        <h2 className="font-semibold">Blog subject & AI writer</h2>
      </div>
      <p className="relative mt-1 text-sm text-soft">Give a subject, optionally add notes, and generate a full draft with highlights, coloured key phrases and callouts. You always review before publishing.</p>
      <div className="relative mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input value={subject} onChange={(e) => onSubject(e.target.value)} maxLength={160} placeholder="e.g. How I use Claude Code to refactor a Next.js app" className="field" />
        <button type="button" onClick={generate} disabled={busy} className="btn !bg-violet-600 text-white hover:!bg-violet-700">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generate with AI
        </button>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1500} rows={2} placeholder="Optional notes: key points, audience, examples to include…" className="field resize-y sm:col-span-2" />
      </div>
    </div>
  );
}
