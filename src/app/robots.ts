import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Replaces the old public/robots.txt, which had three separate
 * `User-agent: *` groups (only the first is honoured) and two invented
 * directives — `Cache-delay` and `Request-rate` — that no crawler reads.
 *
 * One group per agent, and no `Crawl-delay` for Google: Googlebot ignores
 * it, and setting it only slows the crawlers that do obey.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admins", "/admins/", "/api/", "/_next/"],
      },
      {
        userAgent: ["Googlebot", "Googlebot-Image", "Bingbot"],
        allow: "/",
        disallow: ["/admins", "/admins/", "/api/"],
      },
      {
        // SEO scrapers that add crawl load without sending traffic.
        userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot", "PetalBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
