"use client";

import { Check, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ICONS, TechIcon, iconLabel } from "@/lib/icons";

const KIND_LABEL = { tech: "Technologies", ai: "AI tools", ui: "Generic" } as const;

export default function IconPicker({
  value,
  onChange,
  multiple = false,
}: {
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
}) {
  const selected = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = (key: string) => {
    if (!multiple) {
      onChange(key);
      setOpen(false);
      return;
    }
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  const groups = (Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((kind) => ({
    kind,
    keys: Object.keys(ICONS).filter(
      (k) => ICONS[k].kind === kind && (!q || k.includes(q.toLowerCase()) || ICONS[k].label.toLowerCase().includes(q.toLowerCase())),
    ),
  }));

  return (
    <div ref={ref} className="relative">
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border bg-bg p-1.5">
        {selected.map((k) => (
          <span key={k} className="chip !py-1 !text-fg">
            <TechIcon name={k} className="h-3.5 w-3.5" /> {iconLabel(k)}
            {multiple && (
              <button type="button" onClick={() => toggle(k)} aria-label={`Remove ${iconLabel(k)}`} className="text-muted hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-soft hover:bg-elev hover:text-fg">
          <Plus className="h-3.5 w-3.5" /> {selected.length ? (multiple ? "Add" : "Change") : "Choose icon"}
        </button>
      </div>
      {open && (
        <div className="panel absolute z-30 mt-2 w-full min-w-[300px] p-3 shadow-2xl">
          <label className="mb-3 flex items-center gap-2 rounded-lg border bg-bg px-3">
            <Search className="h-4 w-4 text-muted" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search icons…" className="w-full bg-transparent py-2 text-sm outline-none" />
          </label>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {groups.map(
              (g) =>
                g.keys.length > 0 && (
                  <div key={g.kind}>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{KIND_LABEL[g.kind]}</p>
                    <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
                      {g.keys.map((k) => (
                        <button
                          type="button"
                          key={k}
                          onClick={() => toggle(k)}
                          className={`relative flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition ${selected.includes(k) ? "border-accent bg-accent/10" : "border-transparent hover:bg-elev"}`}
                        >
                          <TechIcon name={k} className="h-4 w-4 shrink-0" />
                          <span className="truncate">{ICONS[k].label}</span>
                          {selected.includes(k) && <Check className="absolute right-1 top-1 h-3 w-3 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
