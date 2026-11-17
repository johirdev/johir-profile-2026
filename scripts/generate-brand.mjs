/**
 * Generates every brand / SEO image from two sources:
 *   public/images/logo-johirul-islam-rasel.png  — the owner's JR logo
 *   public/images/johir-portrait.png            — the portrait
 *
 *   node scripts/generate-brand.mjs   (or: npm run gen:brand)
 *
 * Replace the logo file with a larger version (1024px+) and re-run for sharper icons.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");
const PORTRAIT_SRC = path.join(PUBLIC, "images", "johir-portrait.png");
const LOGO_SRC = path.join(PUBLIC, "images", "logo-johirul-islam-rasel.png");

const ACCENT = "#ff6333";

const NAME = "Johirul Islam Rasel";
const ROLE = "Software Engineer";
const STACK = "Next.js  ·  React  ·  TypeScript  ·  Go  ·  Node.js  ·  AI";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://johir.coders24.com").replace(/^https?:\/\//, "").replace(/\/$/, "");

const out = async (file, data) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  console.log("✓", path.relative(ROOT, file));
};

/** ICO container holding PNG frames (supported by every modern browser). */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  const dir = Buffer.alloc(16 * frames.length);
  let offset = 6 + dir.length;
  frames.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...frames.map((f) => f.data)]);
}

/** Logo centred on a transparent (or solid) square, scaled to the `fill` fraction of the canvas. */
async function logoPng(size, { fill = 1, bg } = {}) {
  const inner = Math.round(size * fill);
  const logo = await sharp(LOGO_SRC).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function icons() {
  const dark = { r: 10, g: 10, b: 10, alpha: 1 };
  await out(path.join(APP, "icon.png"), await logoPng(512));
  await out(path.join(APP, "apple-icon.png"), await logoPng(180, { fill: 0.8, bg: dark }));
  await out(path.join(PUBLIC, "icon-192.png"), await logoPng(192));
  await out(path.join(PUBLIC, "icon-512.png"), await logoPng(512));
  await out(path.join(PUBLIC, "icon-maskable-512.png"), await logoPng(512, { fill: 0.62, bg: dark }));
  const frames = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await logoPng(size) })));
  await out(path.join(APP, "favicon.ico"), ico(frames));
}

async function portraits() {
  // Keyword-rich file names help Google Images associate the photo with the name.
  await out(
    path.join(PUBLIC, "images", "johirul-islam-rasel-software-engineer.png"),
    await sharp(PORTRAIT_SRC).png({ compressionLevel: 9, palette: false }).toBuffer(),
  );
  const meta = await sharp(PORTRAIT_SRC).metadata();
  const side = Math.min(meta.width, meta.height);
  const square = await sharp(PORTRAIT_SRC)
    .extract({ left: Math.round((meta.width - side) / 2), top: 0, width: side, height: side })
    .resize(1200, 1200)
    .flatten({ background: "#f4f4f5" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  await out(path.join(PUBLIC, "images", "johirul-islam-rasel.jpg"), square);
}

async function ogCard() {
  const W = 1200;
  const H = 630;
  const font = "Space Grotesk, Segoe UI, Arial, sans-serif";
  const bg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="0.8" cy="0.62" r="0.5">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#000"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="152" y="106" font-family="${font}" font-size="22" font-weight="600" fill="#a1a1aa">${SITE}</text>
  <text x="72" y="268" font-family="${font}" font-size="68" font-weight="700" letter-spacing="-2" fill="#fafafa">Johirul Islam</text>
  <text x="72" y="344" font-family="${font}" font-size="68" font-weight="700" letter-spacing="-2" fill="#fafafa">Rasel</text>
  <text x="72" y="412" font-family="${font}" font-size="40" font-weight="600" fill="${ACCENT}">${ROLE}</text>
  <text x="72" y="466" font-family="${font}" font-size="22" font-weight="500" fill="#a1a1aa">${STACK}</text>
  <rect x="72" y="514" width="250" height="44" rx="22" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14"/>
  <circle cx="98" cy="536" r="6" fill="#22c55e"/>
  <text x="114" y="543" font-family="${font}" font-size="18" font-weight="600" fill="#e4e4e7">Open to work · Bangladesh</text>
</svg>`;
  const portrait = await sharp(PORTRAIT_SRC).resize({ height: 600 }).toBuffer();
  const pm = await sharp(portrait).metadata();
  const logo = await sharp(LOGO_SRC).resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const card = await sharp(Buffer.from(bg))
    .composite([
      { input: logo, left: 72, top: 64 },
      { input: portrait, left: W - pm.width + 40, top: H - pm.height },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await out(path.join(PUBLIC, "og.png"), card);
}

await icons();
await portraits();
await ogCard();
