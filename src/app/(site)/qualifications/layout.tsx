import { pageMetadata } from "@/lib/seo";

// The title is just the page name — the root layout appends
// "| Johirul Islam Rasel" via its template. Spelling the brand out here too
// produced "... | Johirul Islam Rasel | Johirul Islam Rasel".
export const metadata = pageMetadata({
  title: "Qualifications & Experience",
  description:
    "4+ years of professional experience in full-stack web development — React, Next.js, TypeScript, Node.js and Go — plus education, certifications and the roles behind them.",
  path: "/qualifications",
});

export default function QualificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
