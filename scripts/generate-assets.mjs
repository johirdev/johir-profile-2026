/**
 * Generates SEO / PWA image assets from the two source images in /public.
 * Run with: node scripts/generate-assets.mjs
 *
 *  public/johir.png                -> og.png, twitter-image.png, johir-square.png
 *  public/Johirul-islam-rasel.png  -> app icons + PWA icons
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");

const PORTRAIT = path.join(PUBLIC, "johir.png");
const LOGO = path.join(PUBLIC, "Johirul-islam-rasel.png");

const NAME = "Md. Johirul Islam Rasel";
const ROLE = "Full-Stack Software Engineer";
const STACK = "React  ·  Next.js  ·  TypeScript  ·  Node.js  ·  Go";
const SITE = "johir.coders24.com";

const INK = "#eaf2fb";
const DIM = "#93aac6";
const ACCENT = "#22d3ee";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── 1200x630 Open Graph card ───────────────────────────────── */
async function buildOgCard(out, { width = 1200, height = 630 } = {}) {
  const cx = width - 300;
  const cy = height / 2;
  const r = 232;

  const bg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#050b16"/>
      <stop offset="55%" stop-color="#08182b"/>
      <stop offset="100%" stop-color="#04101f"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.5" r="0.55">
      <stop offset="0%"   stop-color="${ACCENT}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${ACCENT}" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${width}" height="6" fill="${ACCENT}"/>

  <!-- availability pill -->
  <rect x="72" y="112" width="286" height="42" rx="21"
        fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-opacity="0.4"/>
  <circle cx="97" cy="133" r="5" fill="${ACCENT}"/>
  <text x="115" y="139" font-family="Segoe UI, Arial, sans-serif" font-size="16"
        font-weight="700" letter-spacing="2.4" fill="${ACCENT}">AVAILABLE FOR WORK</text>

  <!-- name -->
  <text x="72" y="232" font-family="Segoe UI, Arial, sans-serif" font-size="62"
        font-weight="800" letter-spacing="-1.6" fill="${INK}">Md. Johirul Islam</text>
  <text x="72" y="304" font-family="Segoe UI, Arial, sans-serif" font-size="62"
        font-weight="800" letter-spacing="-1.6" fill="${ACCENT}">Rasel</text>

  <!-- role -->
  <text x="72" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="30"
        font-weight="600" fill="${INK}" fill-opacity="0.92">${esc(ROLE)}</text>

  <!-- stack -->
  <text x="72" y="424" font-family="Segoe UI, Arial, sans-serif" font-size="20"
        font-weight="500" fill="${DIM}">${esc(STACK)}</text>

  <!-- footer rule + url -->
  <rect x="72" y="474" width="360" height="1" fill="${ACCENT}" fill-opacity="0.28"/>
  <text x="72" y="522" font-family="Segoe UI, Arial, sans-serif" font-size="22"
        font-weight="700" letter-spacing="0.6" fill="${ACCENT}">${esc(SITE)}</text>

  <!-- portrait ring -->
  <circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="${ACCENT}" stroke-opacity="0.28" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 4}"  fill="none" stroke="${ACCENT}" stroke-opacity="0.55" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff"/>
</svg>`);

  // Crop the portrait to a head-and-shoulders square, then mask it to a circle.
  const meta = await sharp(PORTRAIT).metadata();
  const side = Math.round(meta.width * 0.82);
  const portrait = await sharp(PORTRAIT)
    .extract({
      left: Math.round((meta.width - side) / 2),
      top: Math.round(meta.height * 0.02),
      width: side,
      height: Math.min(side, meta.height - Math.round(meta.height * 0.02)),
    })
    .resize(r * 2, r * 2, { fit: "cover", position: "top" })
    .toBuffer();

  const circleMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${r * 2}" height="${r * 2}">
       <circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/>
     </svg>`
  );

  const masked = await sharp(portrait)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp(bg)
    .composite([{ input: masked, left: cx - r, top: cy - r }])
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log("✓", path.relative(ROOT, out));
}

/* ── square portrait for schema.org / knowledge panel ────────── */
async function buildSquarePortrait(out, size = 1200) {
  const meta = await sharp(PORTRAIT).metadata();
  const side = Math.min(meta.width, meta.height);
  await sharp(PORTRAIT)
    .extract({
      left: Math.round((meta.width - side) / 2),
      top: 0,
      width: side,
      height: side,
    })
    .resize(size, size, { fit: "cover" })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("✓", path.relative(ROOT, out));
}

/* ── icons ──────────────────────────────────────────────────── */
async function buildIcon(out, size, { padding = 0, background } = {}) {
  const inner = size - padding * 2;
  const logo = await sharp(LOGO)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
    .toBuffer();

  const base = background
    ? sharp({ create: { width: size, height: size, channels: 4, background } })
    : sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });

  await base
    .composite([{ input: logo, left: padding, top: padding }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("✓", path.relative(ROOT, out));
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  await buildOgCard(path.join(PUBLIC, "og.png"));
  await buildSquarePortrait(path.join(PUBLIC, "johir-square.png"));

  // Metadata file-convention icons (Next.js reads these automatically)
  await buildIcon(path.join(APP, "icon.png"), 512);
  await buildIcon(path.join(APP, "apple-icon.png"), 180, {
    padding: 14,
    background: { r: 6, g: 13, b: 26, alpha: 1 },
  });

  // PWA manifest icons
  await buildIcon(path.join(PUBLIC, "icon-192.png"), 192);
  await buildIcon(path.join(PUBLIC, "icon-512.png"), 512);
  await buildIcon(path.join(PUBLIC, "icon-maskable-512.png"), 512, {
    padding: 96,
    background: { r: 6, g: 13, b: 26, alpha: 1 },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
