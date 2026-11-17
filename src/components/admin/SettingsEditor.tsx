"use client";

import { ExternalLink, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SETTINGS, type SettingKey } from "@/content/schema";
import { api } from "./api";
import FieldInput, { emptyRecord } from "./FieldInput";

export default function SettingsEditor({ settingKey }: { settingKey: SettingKey }) {
  const def = SETTINGS[settingKey];
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api<Record<string, unknown>>(`/api/settings/${settingKey}`)
      .then((d) => setData({ ...emptyRecord(def.fields), ...d }))
      .catch((e) => toast.error(e.message));
  }, [settingKey, def.fields]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      const body = Object.fromEntries(def.fields.map((f) => [f.name, data[f.name]]));
      setData({ ...data, ...(await api<Record<string, unknown>>(`/api/settings/${settingKey}`, { method: "PUT", body })) });
      setDirty(false);
      toast.success("Saved — the site is updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-muted" />;

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl">
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex items-center gap-3 border-b bg-bg/85 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight">{def.label}</h1>
          <p className="truncate text-xs text-muted">{def.description}</p>
        </div>
        {dirty && <span className="hidden text-xs text-amber-500 sm:inline">Unsaved</span>}
        <a href={settingKey === "about" ? "/#about" : "/"} target="_blank" rel="noopener" className="btn-ghost !px-3 !py-2" aria-label="Preview">
          <ExternalLink className="h-4 w-4" />
        </a>
        <button type="submit" disabled={saving} className="btn-accent !py-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </div>
      <div className="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
        {def.fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={data[f.name]}
            onChange={(v) => {
              setData((d) => ({ ...d!, [f.name]: v }));
              setDirty(true);
            }}
          />
        ))}
      </div>
    </form>
  );
}
