import type { MetadataRoute } from "next";
import { AUTHOR_NAME, AUTHOR_ROLE, DEFAULT_DESCRIPTION } from "@/lib/seo";

/**
 * Replaces public/manifest.json, which declared one 125x125 logo three times
 * under 192/512/maskable sizes. Those files now genuinely exist at those
 * sizes (see scripts/generate-assets.mjs), so installability actually passes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${AUTHOR_NAME} — ${AUTHOR_ROLE}`,
    short_name: "Johir",
    description: DEFAULT_DESCRIPTION,
    start_url: "/?source=pwa",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#060d1a",
    background_color: "#060d1a",
    categories: ["business", "portfolio", "productivity"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Projects", url: "/project" },
      { name: "Blog", url: "/blog" },
      { name: "Start a Project", url: "/start-a-project" },
    ],
  };
}
