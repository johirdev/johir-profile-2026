import { SITE_URL, AUTHOR_NAME, AUTHOR_EMAIL, DEFAULT_DESCRIPTION } from "@/lib/seo";
import { getBlogEntries } from "@/lib/content";

export const revalidate = 3600;

/** Escapes the five XML-significant characters. */
const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cdata = (value: string) =>
  `<![CDATA[${value.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;

export async function GET() {
  const posts = await getBlogEntries(50);
  const buildDate = (posts[0]?.updatedAt ?? new Date()).toUTCString();

  // The previous feed shipped one hardcoded placeholder item; this reads the
  // real posts, and still emits a valid empty channel if there are none.
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.id}`;
      return `    <item>
      <title>${cdata(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${cdata(post.description)}</description>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <dc:creator>${cdata(AUTHOR_NAME)}</dc:creator>${
        post.image ? `\n      <enclosure url="${xml(post.image)}" type="image/jpeg" />` : ""
      }
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${cdata(`${AUTHOR_NAME} — Blog`)}</title>
    <link>${xml(`${SITE_URL}/blog`)}</link>
    <atom:link href="${xml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />
    <description>${cdata(DEFAULT_DESCRIPTION)}</description>
    <language>en-us</language>
    <managingEditor>${xml(`${AUTHOR_EMAIL} (${AUTHOR_NAME})`)}</managingEditor>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
