/**
 * Theme-aware screenshots via the Chrome DevTools Protocol.
 *
 * `chrome --screenshot` cannot set a theme: headless reports
 * prefers-color-scheme as no-preference, so the page always falls back to
 * dark. CDP can emulate the media feature, which is the only way to actually
 * look at the light palette.
 *
 * Usage: node scripts/screenshot.mjs <baseUrl> <outDir> [path...]
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import os from "node:os";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT_DIR = process.argv[3] ?? "screenshots";
const PATHS = process.argv.slice(4).length ? process.argv.slice(4) : ["/"];

const PORT = 9222 + Math.floor(Math.random() * 500);
const PROFILE = path.join(os.tmpdir(), `cdp-profile-${PORT}`);

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      const resolver = this.pending.get(msg.id);
      if (!resolver) return;
      this.pending.delete(msg.id);
      msg.error ? resolver.reject(new Error(msg.error.message)) : resolver.resolve(msg.result);
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    return new CDP(ws);
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) =>
      this.pending.set(id, { resolve, reject })
    );
  }
}

async function findChrome() {
  const { existsSync } = await import("node:fs");
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error("No Chrome or Edge binary found.");
  return found;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const chrome = spawn(await findChrome(), [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${PROFILE}`,
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ]);
  chrome.stderr.on("data", () => {});

  // Wait for the debugging endpoint to answer.
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

  const browser = await CDP.connect(wsUrl);

  for (const theme of ["light", "dark"]) {
    for (const routePath of PATHS) {
      const { targetId } = await browser.send("Target.createTarget", {
        url: "about:blank",
      });
      const { sessionId } = await browser.send("Target.attachToTarget", {
        targetId,
        flatten: true,
      });

      // Flat sessions need the sessionId on every message.
      const page = {
        send: (method, params = {}) => {
          const id = ++browser.id;
          browser.ws.send(JSON.stringify({ id, sessionId, method, params }));
          return new Promise((resolve, reject) =>
            browser.pending.set(id, { resolve, reject })
          );
        },
      };

      await page.send("Page.enable");
      await page.send("Emulation.setDeviceMetricsOverride", {
        width: 1600,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await page.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-color-scheme", value: theme }],
      });

      await page.send("Page.navigate", { url: `${BASE}${routePath}` });
      await sleep(4500);

      // Nudge lazy sections into view, then settle.
      await page.send("Runtime.evaluate", {
        expression: `window.scrollTo(0, document.body.scrollHeight); void 0;`,
      });
      await sleep(1200);
      await page.send("Runtime.evaluate", {
        expression: `window.scrollTo(0, 0); void 0;`,
      });
      await sleep(900);

      const { data } = await page.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
      });

      const slug = routePath === "/" ? "home" : routePath.replace(/\W+/g, "-").replace(/^-|-$/g, "");
      const file = path.join(OUT_DIR, `${slug}-${theme}.png`);
      writeFileSync(file, Buffer.from(data, "base64"));
      console.log("✓", file);

      await browser.send("Target.closeTarget", { targetId });
    }
  }

  chrome.kill();
  await sleep(500);
  try {
    rmSync(PROFILE, { recursive: true, force: true });
  } catch {
    /* profile dir is locked on Windows sometimes; harmless */
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
