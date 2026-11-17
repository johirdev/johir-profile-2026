"use client";

import { Bold, Code, Eye, Heading2, Heading3, Highlighter, Italic, Link2, List, ListOrdered, Loader2, MessageSquareQuote, Palette, PenLine, SquareCode, Lightbulb } from "lucide-react";
import { useId, useState } from "react";
import { api } from "./api";

const SWATCHES = ["#22b8de", "#22d3ee", "#22c55e", "#a78bfa", "#f59e0b", "#ef4444", "#ec4899"];

/**
 * Markdown with a toolbar for the portfolio's extensions:
 * ==highlight==, {color:#hex}text{/color} and > [!TIP] callouts.
 * Preview is rendered server-side by the same sanitiser the blog uses.
 */
export default function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const taId = useId();
  const el_ = () => document.getElementById(taId) as HTMLTextAreaElement | null;
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState(false);

  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = el_();
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };

  const linePrefix = (prefix: string) => {
    const el = el_();
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => el.focus());
  };

  const preview = async () => {
    setTab("preview");
    setLoading(true);
    try {
      setHtml((await api<{ html: string }>("/api/markdown", { method: "POST", body: { markdown: value } })).html);
    } catch (e) {
      setHtml(`<p>${(e as Error).message}</p>`);
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { icon: Heading2, label: "Heading 2" },
    { icon: Heading3, label: "Heading 3" },
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Highlighter, label: "Highlight" },
    { icon: Code, label: "Inline code" },
    { icon: SquareCode, label: "Code block" },
    { icon: Link2, label: "Link" },
    { icon: List, label: "Bullet list" },
    { icon: ListOrdered, label: "Numbered list" },
    { icon: MessageSquareQuote, label: "Quote" },
    { icon: Lightbulb, label: "Callout" },
  ] as const;

  const runTool = (label: string) => {
    switch (label) {
      case "Heading 2":
        return linePrefix("## ");
      case "Heading 3":
        return linePrefix("### ");
      case "Bold":
        return wrap("**");
      case "Italic":
        return wrap("_");
      case "Highlight":
        return wrap("==");
      case "Inline code":
        return wrap("`");
      case "Code block":
        return wrap("\n```ts\n", "\n```\n", "// code");
      case "Link":
        return wrap("[", "](https://)", "link text");
      case "Bullet list":
        return linePrefix("- ");
      case "Numbered list":
        return linePrefix("1. ");
      case "Quote":
        return linePrefix("> ");
      case "Callout":
        return wrap("\n> [!TIP]\n> ", "\n", "Your tip here");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-bg">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-elev/60 p-1.5">
        <div className="mr-2 flex rounded-lg border bg-card p-0.5 text-xs">
          <button type="button" onClick={() => setTab("write")} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 ${tab === "write" ? "bg-fg text-bg" : "text-soft"}`}>
            <PenLine className="h-3.5 w-3.5" /> Write
          </button>
          <button type="button" onClick={preview} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 ${tab === "preview" ? "bg-fg text-bg" : "text-soft"}`}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
        {tab === "write" &&
          tools.map((t) => (
            <button key={t.label} type="button" title={t.label} aria-label={t.label} onClick={() => runTool(t.label)} className="grid h-8 w-8 place-items-center rounded-md text-soft hover:bg-card hover:text-fg">
              <t.icon className="h-4 w-4" />
            </button>
          ))}
        {tab === "write" && (
          <div className="relative">
            <button type="button" title="Text colour" aria-label="Text colour" onClick={() => setPalette((p) => !p)} className="grid h-8 w-8 place-items-center rounded-md text-soft hover:bg-card hover:text-fg">
              <Palette className="h-4 w-4" />
            </button>
            {palette && (
              <div className="panel absolute left-0 top-9 z-20 flex gap-1.5 p-2 shadow-xl">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => {
                      wrap(`{color:${c}}`, "{/color}");
                      setPalette(false);
                    }}
                    className="h-6 w-6 rounded-full border border-white/20"
                    style={{ background: c }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <span className="ml-auto px-2 font-mono text-[10px] text-muted">{value.split(/\s+/).filter(Boolean).length} words</span>
      </div>
      {tab === "write" ? (
        <textarea
          id={taId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          spellCheck
          className="block w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-relaxed outline-none"
          placeholder="Write in Markdown… use ==highlight==, {color:#22b8de}colour{/color}, and > [!TIP] callouts."
        />
      ) : (
        <div className="min-h-[300px] p-6">
          {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted" /> : <div className="prose-pf" dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      )}
    </div>
  );
}
