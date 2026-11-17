/**
 * One-shot codemod: collapses the per-component `dark ? "..." : "..."`
 * class ternaries into the semantic tokens defined in tailwind.config.js.
 *
 * Why: the ternaries required useThemeStore() in every component, which made
 * the whole tree client-only and rendered the dark palette on the server
 * before hydration. The tokens resolve from CSS custom properties instead, so
 * the same markup is correct in both themes with no JS involved.
 *
 * Run: node scripts/map-theme-tokens.mjs <file...>
 */
import { readFileSync, writeFileSync } from "node:fs";

const MAP = new Map(
  Object.entries({
    /* ── Text ────────────────────────────────────────── */
    'text-white|text-slate-900': "text-ink",
    'text-white|text-slate-800': "text-ink",
    'text-white/80|text-slate-700': "text-ink",
    'text-[#dce8f4]|text-slate-700': "text-ink",
    'text-white/70|text-accent': "text-accent",
    'text-accent|text-accent': "text-accent",
    'text-accent/40|text-accent': "text-accent/40",
    'text-white/70|text-slate-600': "text-ink-soft",
    'text-white/75|text-slate-600': "text-ink-soft",
    'text-slate-300|text-slate-600': "text-ink-soft",
    'text-[#6b8aaa]|text-slate-500': "text-ink-soft",
    'text-[#8ba3c0]|text-slate-500': "text-ink-soft",
    'text-[#7d97b5]|text-slate-500': "text-ink-soft",
    'text-[#a8c0d8]|text-slate-500': "text-ink-soft",
    'text-[#a8c0d8]|text-slate-600': "text-ink-soft",
    'text-[#a8bfd4]|text-slate-600': "text-ink-soft",
    'text-[#8ab5cc]|text-slate-600': "text-ink-soft",
    'text-[#b9cbe0]|text-slate-600': "text-ink-soft",
    'text-white/50|text-slate-400': "text-ink-muted",
    'text-white/40|text-slate-400': "text-ink-muted",
    'text-[#6b8aaa]|text-slate-400': "text-ink-muted",
    'text-[#4a6480]|text-slate-400': "text-ink-muted",
    'text-[#4a6a8a]|text-slate-400': "text-ink-muted",
    'text-[#6b8aaa] hover:text-accent|text-slate-500 hover:text-accent':
      "text-ink-soft hover:text-accent",
    'text-[#6b8aaa] group-hover:text-accent|text-slate-500 group-hover:text-accent':
      "text-ink-soft group-hover:text-accent",
    'text-white/60 hover:text-accent hover:bg-accent/10|text-slate-500 hover:text-accent hover:bg-accent-soft':
      "text-ink-soft hover:text-accent hover:bg-accent-soft",
    'placeholder-[#3a5a7a]|placeholder-slate-400': "placeholder-ink-muted",

    /* ── Surfaces ────────────────────────────────────── */
    'bg-[#0f1e35]|bg-white': "bg-card",
    'bg-[#0f1e35]|bg-slate-50': "bg-card",
    'bg-[#0a1628]|bg-white': "bg-card",
    'bg-[#060f1e]|bg-white': "bg-card",
    'bg-[#0b1626]|bg-white': "bg-card",
    'bg-[#0a1628]|bg-slate-50': "bg-surface",
    'bg-[#0b1628]|bg-slate-100': "bg-surface",
    'bg-[#1a3050]|bg-slate-100': "bg-surface",
    'bg-[#162d4a]|bg-slate-100': "bg-surface",
    'bg-[#040c18]|bg-slate-100': "bg-surface",
    'bg-white/5|bg-slate-100': "bg-surface",
    'bg-white/[0.06]|bg-slate-100': "bg-surface",
    'bg-[#07111f]|bg-slate-50': "bg-base",
    'bg-[#060f1e]|bg-slate-50': "bg-base",
    'bg-[#1e3a5f]|bg-slate-200': "bg-ink-muted/25",
    'bg-white/5|bg-slate-200': "bg-ink-muted/20",
    'bg-[#1a3050]|bg-slate-300': "bg-ink-muted/35",
    'bg-white/10|bg-slate-300': "bg-ink-muted/35",
    'bg-[#0f1e35] border-[#1a3050]|bg-white border-slate-200':
      "bg-card border-line",
    'bg-[#0f1e35] border border-[#1a3050]|bg-white border border-slate-200 shadow-sm':
      "bg-card border border-line shadow-e1",

    /* ── Lines ───────────────────────────────────────── */
    'border-[#1a3050]|border-slate-200': "border-line",
    'border-[#1a3050]|border-slate-100': "border-line",
    'border-white/5|border-slate-200': "border-line",
    'border-white/10|border-slate-200': "border-line",
    'border-white/[0.06]|border-slate-100': "border-line",
    'border-accent/10|border-slate-200': "border-line-card",
    'border-[#060d1a]|border-white': "border-base",
    'ring-white/10|ring-slate-200': "ring-line",
    'ring-accent/30|ring-accent-line': "ring-accent-line",
    'border-white/20|border-accent-line': "border-accent-line",
    'border-accent/20|border-accent-line': "border-accent-line",
    'border-accent/25|border-accent-line': "border-accent-line",
    'border-accent/15|border-accent-line': "border-accent-line",
    'border-accent/40|border-accent-line': "border-accent-line",
    'border-[#1a3050] focus:border-accent/60|border-slate-200 focus:border-accent-line':
      "border-line focus:border-accent",

    /* ── Accent surfaces ─────────────────────────────── */
    'bg-accent/10|bg-accent-soft': "bg-accent-soft",
    'bg-accent/15|bg-accent-soft': "bg-accent-soft",
    'bg-accent/20|bg-accent-soft': "bg-accent-soft",
    'bg-accent-solid|bg-accent-solid': "bg-accent-solid",
    'bg-accent/70|bg-accent-solid': "bg-accent-solid",
    'bg-accent/20|bg-accent-solid': "bg-accent-solid",
    'bg-accent/10 text-accent|bg-accent-soft text-accent':
      "bg-accent-soft text-accent",
    'bg-accent/5 border-accent/20|bg-accent-soft border-accent-line':
      "bg-accent-soft border-accent-line",
    'bg-accent/15 text-accent border-accent/20|bg-accent-soft text-accent border-accent-line':
      "bg-accent-soft text-accent border-accent-line",

    /* ── Hover / elevation ───────────────────────────── */
    'hover:border-accent/40|hover:border-accent-line': "hover:border-accent-line",
    'hover:bg-accent/20 hover:border-accent/30|hover:bg-accent-soft hover:border-accent-line':
      "hover:bg-accent-soft hover:border-accent-line",
    'hover:bg-[#152540] hover:border-accent/30|hover:bg-accent/50 hover:border-accent-line':
      "hover:bg-card-hover hover:border-accent-line",
    'hover:bg-[#152540] hover:border-accent/20|hover:bg-slate-50 hover:border-accent-line':
      "hover:bg-card-hover hover:border-accent-line",
    'hover:border-accent/40 hover:bg-[#122040]|hover:border-accent-line hover:shadow-md hover:shadow-accent/60':
      "hover:border-accent-line hover:bg-card-hover hover:shadow-e3",
    'shadow-none|shadow-sm': "shadow-e1",
    'shadow-2xl shadow-black/50|shadow-lg': "shadow-e3",
    'bg-[#0f1e35] border-[#1a3050] hover:bg-accent/20 hover:border-accent/40|bg-slate-100 border-slate-200 hover:bg-accent-soft hover:border-accent-line':
      "bg-card border-line hover:bg-accent-soft hover:border-accent-line",
    'bg-[#0f1e35] border border-[#1a3050] hover:border-accent/30 hover:bg-[#152540]|bg-white border border-slate-200 hover:border-accent-line hover:bg-accent/30':
      "bg-card border border-line hover:border-accent-line hover:bg-card-hover",
    'border border-[#1a3050] hover:border-accent/50 text-white hover:bg-[#152540]|border border-slate-200 hover:border-accent-line text-slate-800 hover:text-accent':
      "border border-line hover:border-accent-line text-ink hover:bg-card-hover",
    'border-white/15 text-white/80 hover:border-white/30|border-slate-200 text-slate-600 hover:border-slate-300':
      "border-line text-ink-soft hover:border-accent-line",
    'border-white/15 text-white/80|border-slate-300 text-slate-700':
      "border-line text-ink-soft",
    'border-white/15 text-white/70 hover:border-white/30|border-slate-200 text-slate-500 hover:border-slate-300':
      "border-line text-ink-soft hover:border-accent-line",
  })
);

const TERNARY = /\bdark\s*\?\s*"([^"]*)"\s*:\s*"([^"]*)"/gs;

let totalReplaced = 0;
const unmatched = new Map();

for (const file of process.argv.slice(2)) {
  const before = readFileSync(file, "utf8");
  let replaced = 0;

  const after = before.replace(TERNARY, (whole, darkValue, lightValue) => {
    const key = `${darkValue}|${lightValue}`;
    const token = MAP.get(key);
    if (token === undefined) {
      unmatched.set(key, (unmatched.get(key) ?? 0) + 1);
      return whole;
    }
    replaced += 1;
    return JSON.stringify(token);
  });

  if (after !== before) writeFileSync(file, after);
  totalReplaced += replaced;
  console.log(`${String(replaced).padStart(3)}  ${file}`);
}

console.log(`\ntotal replaced: ${totalReplaced}`);
if (unmatched.size) {
  console.log("\nleft as-is (intentional or non-neutral colour):");
  for (const [key, count] of [...unmatched].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(2)}  ${key.replace("|", "  =>  ")}`);
  }
}
