import type { Metadata } from "next";
import StartProject from "@/app/components/Clients/pages/StartProject/StartProject";
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  PERSON_ID,
  SITE_URL,
  WEBSITE_ID,
  jsonLd,
  pageMetadata,
} from "@/lib/seo";

/**
 * This page previously canonicalised to `johir.corders24.com` (misspelled
 * host, so the canonical pointed at a domain that does not resolve) and
 * advertised an OG image at /icons/icon-512x512.png, which 404s. Both now
 * come from the shared SEO config.
 */
export const metadata: Metadata = pageMetadata({
  title: "Start a Project",
  description:
    "Tell me about your project and get a reply within 24 hours. Available for full-stack web development — React, Next.js, TypeScript, Node.js and Go — freelance or full-time.",
  path: "/start-a-project",
});

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}/start-a-project#contact`,
  url: `${SITE_URL}/start-a-project`,
  name: `Start a Project with ${AUTHOR_NAME}`,
  description:
    "Project enquiry form for full-stack web development work — React, Next.js, TypeScript, Node.js and Go.",
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": PERSON_ID },
  mainEntity: {
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR_NAME,
    email: `mailto:${AUTHOR_EMAIL}`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Project enquiries",
      email: AUTHOR_EMAIL,
      availableLanguage: ["English", "Bengali"],
    },
  },
  inLanguage: "en-US",
};

export default function StartAProjectPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(contactSchema) }}
      />
      <StartProject />
    </div>
  );
}
