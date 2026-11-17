"use client";

import { ChevronDown, ChevronUp, FileText, ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Field } from "@/content/schema";
import { upload } from "./api";
import IconPicker from "./IconPicker";
import MarkdownEditor from "./MarkdownEditor";

type V = unknown;

/** Empty value for a field — used for new records and new list rows. */
export function emptyValue(f: Field): V {
  switch (f.type) {
    case "boolean":
      return f.name === "published" ? true : false;
    case "number":
      return f.name === "order" ? 10 : f.name === "rating" ? 5 : "";
    case "tags":
    case "lines":
    case "icons":
    case "list":
      return [];
    case "select":
      return f.required ? f.options?.[0] ?? "" : "";
    default:
      return "";
  }
}

export function emptyRecord(fields: Field[]) {
  return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

export default function FieldInput({ field, value, onChange }: { field: Field; value: V; onChange: (v: V) => void }) {
  const id = `f-${field.name}`;
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  const control = (() => {
    switch (field.type) {
      case "text":
      case "url":
        return (
          <input
            id={id}
            type={field.type === "url" ? "url" : "text"}
            value={str}
            maxLength={field.max}
            required={field.required}
            placeholder={field.placeholder ?? (field.type === "url" ? "https://" : "")}
            onChange={(e) => onChange(e.target.value)}
            className="field"
          />
        );
      case "textarea":
        return (
          <div className="relative">
            <textarea id={id} value={str} maxLength={field.max} rows={field.max && field.max > 600 ? 6 : 3} required={field.required} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className="field resize-y" />
            {field.max && <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-muted">{str.length}/{field.max}</span>}
          </div>
        );
      case "markdown":
        return <MarkdownEditor value={str} onChange={onChange} />;
      case "number":
        return <input id={id} type="number" value={str} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} className="field" />;
      case "boolean":
        return (
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${value ? "border-transparent bg-accent" : "bg-elev"}`}
          >
            <span className={`h-5 w-5 rounded-full bg-white shadow transition ${value ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        );
      case "select":
        return (
          <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className="field">
            {!field.required && <option value="">—</option>}
            {field.options?.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );
      case "color":
        return (
          <div className="flex items-center gap-2">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(str) ? str : "#ff6333"} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border bg-bg p-1" />
            <input id={id} value={str} onChange={(e) => onChange(e.target.value)} placeholder="#ff6333" maxLength={7} className="field font-mono" />
            {str && (
              <button type="button" onClick={() => onChange("")} className="text-muted hover:text-fg" aria-label="Clear colour">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      case "image":
      case "file":
        return <UploadField kind={field.type} value={str} onChange={onChange} />;
      case "tags":
        return <TagInput value={(value as string[]) ?? []} onChange={onChange} />;
      case "lines":
        return (
          <textarea
            id={id}
            rows={Math.max(3, ((value as string[]) ?? []).length + 1)}
            value={((value as string[]) ?? []).join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n"))}
            placeholder="One item per line"
            className="field resize-y"
          />
        );
      case "icon":
        return <IconPicker value={str} onChange={onChange} />;
      case "icons":
        return <IconPicker multiple value={(value as string[]) ?? []} onChange={onChange} />;
      case "list":
        return <ListField field={field} value={(value as Record<string, V>[]) ?? []} onChange={onChange} />;
    }
  })();

  const inline = field.type === "boolean";
  return (
    <div className={`${field.half ? "" : "sm:col-span-2"} ${inline ? "flex items-center justify-between gap-4 rounded-xl border bg-bg px-4 py-3" : ""}`}>
      <label htmlFor={id} className={inline ? "text-sm font-medium" : "label"}>
        {field.label}
        {field.required && <span className="text-accent"> *</span>}
        {field.help && !inline && <span className="ml-2 font-normal normal-case tracking-normal text-muted/80">— {field.help}</span>}
      </label>
      {control}
    </div>
  );
}

function UploadField({ kind, value, onChange }: { kind: "image" | "file"; value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const send = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await upload(file);
      onChange(res.url);
      toast.success("Uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        send(e.dataTransfer.files[0]);
      }}
      className={`flex items-center gap-3 rounded-xl border bg-bg p-2 transition ${drag ? "border-accent ring-4 ring-accent/10" : ""}`}
    >
      <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border bg-elev">
        {value && kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin URL preview
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : kind === "file" ? (
          <FileText className="h-6 w-6 text-muted" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={kind === "image" ? "https://… or upload" : "/file.pdf or upload"} className="w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:border-accent/60" />
        <div className="flex gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-fg px-3 py-1.5 text-xs font-medium text-bg disabled:opacity-60">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {kind === "image" ? "Upload image" : "Upload PDF"}
          </button>
          {value && (
            <>
              <a href={value} target="_blank" rel="noopener" className="rounded-lg border px-3 py-1.5 text-xs text-soft hover:text-fg">Open</a>
              <button type="button" onClick={() => onChange("")} className="rounded-lg border px-3 py-1.5 text-xs text-soft hover:text-red-500">Remove</button>
            </>
          )}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        hidden
        accept={kind === "image" ? "image/png,image/jpeg,image/webp,image/gif,image/avif" : "application/pdf"}
        onChange={(e) => {
          send(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().replace(/,$/, "");
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border bg-bg p-1.5">
      {value.map((t) => (
        <span key={t} className="chip !py-1 !text-fg">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="text-muted hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder="Type and press Enter"
        className="min-w-[120px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
      />
    </div>
  );
}

function ListField({ field, value, onChange }: { field: Field; value: Record<string, V>[]; onChange: (v: V) => void }) {
  const sub = field.fields ?? [];
  const [open, setOpen] = useState<number | null>(value.length ? null : 0);
  const titleOf = (row: Record<string, V>) => String(row[sub[0]?.name] ?? "") || `Item`;

  const update = (i: number, key: string, v: V) => onChange(value.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };

  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="rounded-xl border bg-bg">
          <div className="flex items-center gap-2 px-3 py-2">
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium">
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate">{titleOf(row)}</span>
            </button>
            <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded p-1 text-muted hover:bg-elev hover:text-fg"><ChevronUp className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded p-1 text-muted hover:bg-elev hover:text-fg"><ChevronDown className="h-4 w-4" /></button>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove" className="rounded p-1 text-muted hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
          {open === i && (
            <div className="grid gap-4 border-t p-4 sm:grid-cols-2">
              {sub.map((f) => (
                <FieldInput key={f.name} field={f} value={row[f.name]} onChange={(v) => update(i, f.name, v)} />
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          onChange([...value, emptyRecord(sub)]);
          setOpen(value.length);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-2 text-sm text-soft hover:border-accent/50 hover:text-fg"
      >
        <Plus className="h-4 w-4" /> Add {field.label.toLowerCase().replace(/s$/, "")}
      </button>
    </div>
  );
}
