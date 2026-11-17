import type { Metadata } from "next";
import BlogDetails from "@/app/components/Clients/Home/Blog/Details/BlogDetails";
import { getBlogById, clampDescription } from "@/lib/content";
import {
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  PERSON_ID,
  SITE_URL,
  jsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

/**
 * Without this, every post inherited the site-wide title and description —
 * Search Console reads that as duplicate titles across the whole blog, and
 * a shared link showed the generic card rather than the post.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogById(id);

  if (!post) {
    return {
      title: "Blog",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: `/blog/${id}` },
    };
  }

  const description = clampDescription(post.description || DEFAULT_DESCRIPTION);
  const image = post.image || OG_IMAGE;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.id}` },
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    openGraph: {
      type: "article",
      url: `${SITE_URL}/blog/${post.id}`,
      title: post.title,
      description,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [AUTHOR_NAME],
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function BlogDetailsPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlogById(id);

  const articleSchema = post && {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.id}#article`,
    headline: post.title,
    description: clampDescription(post.description),
    image: post.image ? [post.image] : [OG_IMAGE],
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.id}`,
    },
    inLanguage: "en-US",
  };

  return (
    <div>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }}
        />
      )}
      <BlogDetails />
    </div>
  );
}
