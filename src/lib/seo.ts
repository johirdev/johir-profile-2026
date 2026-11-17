import type { Metadata } from "next";

/* ============================================================
   Single source of truth for every SEO surface.
   ============================================================ */

/** Falls back to the production host so metadataBase is never relative. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://johir.coders24.com"
).replace(/\/$/, "");

export const AUTHOR_NAME = "Md. Johirul Islam Rasel";
export const AUTHOR_SHORT = "Johirul Islam Rasel";
export const AUTHOR_EMAIL = "johirul.islam.rasel@gmail.com";
export const AUTHOR_ROLE = "Full-Stack Software Engineer";

/**
 * The 1200x630 card that renders whenever the URL is pasted into Google,
 * WhatsApp, Facebook, LinkedIn, X, Slack or Discord. Built from
 * public/johir.png by scripts/generate-assets.mjs.
 */
export const OG_IMAGE = `${SITE_URL}/og.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Square portrait — what Google prefers for a person's rich result. */
export const PORTRAIT_SQUARE = `${SITE_URL}/johir-square.png`;
/** Original full-bleed portrait. */
export const PORTRAIT_FULL = `${SITE_URL}/johir.png`;
export const LOGO_IMAGE = `${SITE_URL}/icon-512.png`;

export const SOCIAL_LINKS = [
  "https://github.com/johirul-islam",
  "https://linkedin.com/in/johirul-islam-rasel",
  "https://twitter.com/johirul_rasel",
  "https://www.facebook.com/johirul.islam.rasel",
] as const;

export const DEFAULT_TITLE = `${AUTHOR_SHORT} — ${AUTHOR_ROLE}`;

export const DEFAULT_DESCRIPTION =
  "Johirul Islam Rasel is a Full-Stack Software Engineer with 4+ years of experience building fast, scalable web applications with React, Next.js, TypeScript, Node.js and Go. Available for freelance and full-time work.";

/**
 * Name variants matter more than generic keywords for a personal-brand
 * query: they are what a searcher actually types.
 */
export const KEYWORDS = [
  "Johirul Islam Rasel",
  "Md Johirul Islam Rasel",
  "Johirul Islam",
  "Johirul Rasel",
  "Johir",
  "Johir Coders24",
  "Rasel Software Engineer",
  "Full-Stack Software Engineer",
  "React Developer Bangladesh",
  "Next.js Developer Bangladesh",
  "TypeScript Developer",
  "Node.js Developer",
  "Go Golang Developer",
  "MERN Stack Developer",
  "Frontend Engineer Dhaka",
  "Freelance Software Engineer Bangladesh",
  "Hire Next.js Developer",
];

const ogImages = [
  {
    url: OG_IMAGE,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: `${AUTHOR_NAME} — ${AUTHOR_ROLE}`,
    type: "image/png",
  },
];

export const sharedMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${AUTHOR_SHORT}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: AUTHOR_SHORT,
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${AUTHOR_SHORT} — Blog` }],
    },
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    siteName: `${AUTHOR_SHORT} — Portfolio`,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ogImages,
    firstName: "Johirul",
    lastName: "Islam Rasel",
    username: "johirul_rasel",
  },
  twitter: {
    card: "summary_large_image",
    site: "@johirul_rasel",
    creator: "@johirul_rasel",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: `${AUTHOR_NAME} — ${AUTHOR_ROLE}` }],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: AUTHOR_SHORT,
    statusBarStyle: "black-translucent",
  },
};

/* ============================================================
   Structured data

   Emitted as one @graph rather than several loose <script> tags —
   the nodes cross-reference by @id, which is how Google resolves the
   person, the site and the page into a single entity.
   ============================================================ */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const personSchema = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: AUTHOR_NAME,
  alternateName: [
    "Johirul Islam Rasel",
    "Johirul Islam",
    "Johirul Rasel",
    "Johir",
  ],
  givenName: "Johirul",
  familyName: "Islam Rasel",
  url: SITE_URL,
  mainEntityOfPage: { "@id": WEBSITE_ID },
  email: `mailto:${AUTHOR_EMAIL}`,
  /* Several aspect ratios — Google picks whichever fits the result type. */
  image: {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#portrait`,
    url: PORTRAIT_SQUARE,
    contentUrl: PORTRAIT_SQUARE,
    width: 1200,
    height: 1200,
    caption: `${AUTHOR_NAME} — ${AUTHOR_ROLE}`,
  },
  sameAs: [...SOCIAL_LINKS],
  jobTitle: AUTHOR_ROLE,
  description: DEFAULT_DESCRIPTION,
  nationality: { "@type": "Country", name: "Bangladesh" },
  address: {
    "@type": "PostalAddress",
    addressCountry: "BD",
  },
  worksFor: { "@id": ORGANIZATION_ID },
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Express.js",
    "Go (Golang)",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Prisma",
    "Tailwind CSS",
    "Docker",
    "Nginx",
    "CI/CD",
    "REST API Design",
    "Web Performance",
    "Full-Stack Development",
  ],
  knowsLanguage: [
    { "@type": "Language", name: "Bengali" },
    { "@type": "Language", name: "English" },
  ],
  seeks: {
    "@type": "Demand",
    name: "Full-Stack Software Engineering roles and freelance projects",
  },
};

export const organizationSchema = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "Coders24",
  url: "https://www.coders24.com",
  logo: {
    "@type": "ImageObject",
    url: LOGO_IMAGE,
    width: 512,
    height: 512,
  },
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: `${AUTHOR_SHORT} — Portfolio`,
  alternateName: [AUTHOR_NAME, "Johir Portfolio"],
  description: DEFAULT_DESCRIPTION,
  inLanguage: "en-US",
  publisher: { "@id": PERSON_ID },
  copyrightHolder: { "@id": PERSON_ID },
};

export const profilePageSchema = {
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": PERSON_ID },
  mainEntity: { "@id": PERSON_ID },
  primaryImageOfPage: { "@id": `${SITE_URL}/#portrait` },
  inLanguage: "en-US",
};

export const breadcrumbSchema = (
  items: ReadonlyArray<{ name: string; path: string }>
) => ({
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export const NAV_BREADCRUMBS = [
  { name: "Home", path: "/" },
  { name: "Qualifications", path: "/qualifications" },
  { name: "Start a Project", path: "/start-a-project" },
] as const;

/** The full graph rendered on the home page. */
export const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    personSchema,
    organizationSchema,
    websiteSchema,
    profilePageSchema,
    breadcrumbSchema(NAV_BREADCRUMBS),
  ],
};

/**
 * `JSON.stringify` does not escape `<`, so a string containing `</script>`
 * would break out of the tag. Escaping it to its unicode form closes that off.
 */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/** Per-page metadata helper so every route gets a correct canonical + OG. */
export const pageMetadata = ({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata => {
  const url = `${SITE_URL}${path}`;
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : ogImages;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: `${AUTHOR_SHORT} — Portfolio`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
};
