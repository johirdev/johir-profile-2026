/**
 * Reads the *computed* colour of real text nodes in a running page and scores
 * each against the background actually painted behind it.
 *
 * Sampling a screenshot cannot do this: antialiased glyph edges blend with the
 * background, so a pixel probe reports a colour the CSS never declared.
 *
 * Usage: node scripts/contrast-audit.mjs <baseUrl> [path]
 */
import { spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import os from "node:os";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const BASE = process.argv[2] ?? "http://localhost:3000";
const ROUTE = process.argv[3] ?? "/";
const PORT = 9800 + Math.floor(Math.random() * 300);
const PROFILE = path.join(os.tmpdir(), `cdp-audit-${PORT}`);

/* Runs inside the page. Walks visible text nodes, resolves the first opaque
   ancestor background, and returns the WCAG ratio for each distinct pairing. */
const AUDIT = `(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const bgOf = (el) => {
    let node = el;
    let acc = null;
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) {
        acc = acc ? over(acc, c) : c;
        if (c.a === 1) return acc.a === 1 ? acc : over(acc, { r: 255, g: 255, b: 255, a: 1 });
      }
      node = node.parentElement;
    }
    const root = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    return acc ? over(acc, root) : root;
  };

  const seen = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue.trim();
    if (text.length < 2) continue;
    const el = node.parentElement;
    if (!el) continue;

    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || +style.opacity === 0) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;

    const fg = parse(style.color);
    if (!fg) continue;

    const bg = bgOf(el);
    const eff = fg.a < 1 ? over(fg, bg) : fg;
    const size = parseFloat(style.fontSize);
    const weight = +style.fontWeight || 400;
    // WCAG "large text": >=24px, or >=18.66px when bold.
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(eff, bg);

    const key = [Math.round(eff.r), Math.round(eff.g), Math.round(eff.b), Math.round(bg.r), Math.round(bg.g), Math.round(bg.b), Math.round(size), large].join("|");
    if (seen.has(key)) { seen.get(key).count++; continue; }

    const hex = (c) => "#" + [c.r, c.g, c.b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("");
    seen.set(key, {
      sample: text.slice(0, 42),
      fg: hex(eff),
      bg: hex(bg),
      size: Math.round(size),
      large,
      ratio: +r.toFixed(2),
      need,
      pass: r >= need,
      count: 1,
    });
  }
  return JSON.stringify([...seen.values()].sort((a, b) => a.ratio - b.ratio));
})()`;

async function main() {
  const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!chromePath) throw new Error("No Chrome or Edge binary found.");

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    `--user-data-dir=${PROFILE}`,
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ]);
  chrome.stderr.on("data", () => {});

  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      wsUrl = (await res.json()).webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
  }
  if (!wsUrl) throw new Error("Chrome debugging endpoint never came up.");

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });

  let msgId = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id);
    m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
  });
  const send = (method, params = {}, sessionId) => {
    const id = ++msgId;
    ws.send(JSON.stringify({ id, sessionId, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  };

  let failures = 0;

  for (const theme of ["light", "dark"]) {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

    await send("Page.enable", {}, sessionId);
    await send("Emulation.setDeviceMetricsOverride",
      { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send("Emulation.setEmulatedMedia",
      { features: [{ name: "prefers-color-scheme", value: theme }] }, sessionId);
    await send("Page.navigate", { url: `${BASE}${ROUTE}` }, sessionId);
    await sleep(4000);

    // Sections reveal on IntersectionObserver; without a scroll pass they sit
    // at opacity 0 and the audit would grade text nobody can see yet.
    await send("Runtime.evaluate", {
      expression: `(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      })()`,
      awaitPromise: true,
    }, sessionId);
    await sleep(1200);

    const { result } = await send("Runtime.evaluate",
      { expression: AUDIT, returnByValue: true }, sessionId);
    const rows = JSON.parse(result.value);

    const failed = rows.filter((r) => !r.pass);
    failures += failed.length;

    console.log(`\n${"=".repeat(74)}\n  ${theme.toUpperCase()} — ${rows.length} distinct text/background pairings\n${"=".repeat(74)}`);
    console.log(`  worst 8:`);
    for (const r of rows.slice(0, 8)) {
      console.log(
        `   ${r.pass ? "PASS" : "FAIL"}  ${String(r.ratio).padStart(6)}:1  (needs ${r.need})  ` +
        `${r.fg} on ${r.bg}  ${r.size}px  "${r.sample}"`
      );
    }
    console.log(`  ${failed.length === 0 ? "No pairing below its WCAG AA threshold." : `${failed.length} pairing(s) below AA.`}`);

    await send("Target.closeTarget", { targetId });
  }

  chrome.kill();
  await sleep(400);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* locked */ }

  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
